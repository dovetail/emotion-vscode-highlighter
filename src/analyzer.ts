import * as ts from "typescript";
import * as vscode from "vscode";
import {
  AnalysisResult,
  EMOTION_IMPORT_PATTERNS,
  EmotionToken,
  ImportInfo,
  PerformanceMetrics,
  TypeCheckingOptions, 
  TypeCheckingResult,
  ExtendedAnalysisResult
} from "./types";

export class EmotionAnalyzer {
  private cache = new Map<
    string,
    { result: ExtendedAnalysisResult; timestamp: number }
  >();
  private typeCache = new Map<string, TypeCheckingResult>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly TYPE_CACHE_DURATION = 60000; // 1 minute for type results

  constructor() {
    if (!ts) {
      throw new Error("TypeScript module not available");
    }
  }

  public async analyze(document: vscode.TextDocument): Promise<ExtendedAnalysisResult> {
    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = this.getCacheKey(document);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    // Get configuration for type checking
    const typeCheckingOptions = this.getTypeCheckingOptions();
    
    // Early exit if file doesn't contain emotion patterns
    // BUT allow type checking to run even without direct emotion patterns
    // since we might have imported styled components
    const text = document.getText();
    console.log(`[Analyzer] Checking file: ${document.fileName}`);
    console.log(`[Analyzer] File content preview: ${text.substring(0, 200)}...`);
    
    const hasPatterns = this.hasEmotionPatterns(text);
    console.log(`[Analyzer] Has emotion patterns: ${hasPatterns}`);
    console.log(`[Analyzer] Type checking enabled: ${typeCheckingOptions.enabled}`);
    
    // Only exit early if no patterns AND type checking is disabled
    // If type checking is enabled, we should continue to detect imported styled components
    if (!hasPatterns && !typeCheckingOptions.enabled) {
      console.log(`[Analyzer] Early exit: no patterns and no type checking`);
      const emptyResult: ExtendedAnalysisResult = {
        styledComponents: new Set(),
        importInfo: {
          hasEmotionImport: false,
          hasStyledComponentsImport: false,
          styledIdentifier: "styled",
        },
        tokens: [],
        typeCheckingEnabled: typeCheckingOptions.enabled,
      };

      this.cache.set(cacheKey, { result: emptyResult, timestamp: Date.now() });
      return emptyResult;
    }
    
    const parseStartTime = performance.now();
    const sourceFile = this.createSourceFile(document);
    const parseTime = performance.now() - parseStartTime;

    const analysisStartTime = performance.now();
    const importInfo = this.analyzeImports(sourceFile);

    // Only exit early if no emotion imports AND type checking is disabled
    // If type checking is enabled, we should continue to detect imported styled components
    if (!importInfo.hasEmotionImport && !importInfo.hasStyledComponentsImport && !typeCheckingOptions.enabled) {
      console.log(`[Analyzer] Early exit: no emotion imports and no type checking`);
      const emptyResult: ExtendedAnalysisResult = {
        styledComponents: new Set(),
        importInfo,
        tokens: [],
        typeCheckingEnabled: typeCheckingOptions.enabled,
      };

      this.cache.set(cacheKey, { result: emptyResult, timestamp: Date.now() });
      return emptyResult;
    }
    
    const styledComponents = this.findStyledComponents(sourceFile, importInfo);
    const analysisTime = performance.now() - analysisStartTime;

    const tokenizationStartTime = performance.now();
    let tokens: EmotionToken[] = [];
    let typeCheckingTime = 0;
    let typeCheckingStats = undefined;

    // Enhanced token finding with type checking
    if (typeCheckingOptions.enabled) {
      const typeCheckingStartTime = performance.now();
      console.log(`[Analyzer] Using VS Code's TypeScript service for type checking`);
      const enhancedResult = await this.findStyledComponentUsageWithVSCodeTypes(
        document,
        styledComponents, 
        typeCheckingOptions
      );
      tokens = enhancedResult.tokens;
      typeCheckingStats = enhancedResult.stats;
      typeCheckingTime = performance.now() - typeCheckingStartTime;
    } else {
      tokens = this.findStyledComponentUsage(sourceFile, styledComponents);
    }

    const tokenizationTime = performance.now() - tokenizationStartTime;

    const result: ExtendedAnalysisResult = {
      styledComponents,
      importInfo,
      tokens,
      typeCheckingEnabled: typeCheckingOptions.enabled,
      typeCheckingStats,
    };
    
    // Cache the result
    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    const totalTime = performance.now() - startTime;
    this.logPerformanceMetrics({
      parseTime,
      analysisTime,
      tokenizationTime,
      totalTime,
      typeCheckingTime,
    });

    return result;
  }

  private getTypeCheckingOptions(): TypeCheckingOptions {
    const config = vscode.workspace.getConfiguration("emotionHighlighter");
    return {
      enabled: config.get("useTypeChecking", true),
      detectImportedComponents: config.get("detectImportedComponents", true),
      cacheTypeResults: config.get("typeCheckingCache", true),
    };
  }

  private async getVSCodeTypeInformation(document: vscode.TextDocument, position: vscode.Position): Promise<string | null> {
    try {
      // Use VS Code's built-in TypeScript service to get type definitions
      const typeDefinitions = await vscode.commands.executeCommand<vscode.LocationLink[] | vscode.Location[]>(
        'vscode.executeTypeDefinitionProvider',
        document.uri,
        position
      );
      
      if (typeDefinitions && typeDefinitions.length > 0) {
        // If we have type definitions, we know this is a typed symbol
        // For styled components, we can check if the type definition comes from @emotion/styled
        const firstDef = typeDefinitions[0];
        let typeUri: vscode.Uri;
        
        if ('targetUri' in firstDef) {
          typeUri = firstDef.targetUri;
        } else if ('uri' in firstDef) {
          typeUri = firstDef.uri;
        } else {
          return null;
        }
        
        const typeFilePath = typeUri.fsPath || typeUri.path;
        console.log(`[VSCode Type Checking] Type definition found at: ${typeFilePath}`);
        
        // Check if the type comes from @emotion/styled or similar
        if (typeFilePath.includes('@emotion/styled') || 
            typeFilePath.includes('emotion-styled') ||
            typeFilePath.includes('styled-components')) {
          return 'StyledComponent'; // Simplified return to indicate it's a styled component
        }
      }
      
      return null;
    } catch (error) {
      console.warn('[VSCode TypeScript Service] Error getting type definition:', error);
      return null;
    }
  }

  private async findStyledComponentUsageWithVSCodeTypes(
    document: vscode.TextDocument,
    styledComponents: Set<string>,
    options: TypeCheckingOptions
  ): Promise<{
    tokens: EmotionToken[];
    stats: {
      totalChecked: number;
      cacheHits: number;
      cacheMisses: number;
    };
  }> {
    const tokens: EmotionToken[] = [];
    const stats = { totalChecked: 0, cacheHits: 0, cacheMisses: 0 };
    
    try {
      const text = document.getText();
      
      // Find JSX elements using regex (simpler approach since we're using VS Code's type checking)
      const jsxRegex = /<(\w+)(?:\s[^>]*)?\s*\/?>/g;
      let match;
      
      while ((match = jsxRegex.exec(text)) !== null) {
        const componentName = match[1];
        
        // Skip HTML elements (start with lowercase)
        if (componentName[0].toLowerCase() === componentName[0]) {
          continue;
        }
        
        stats.totalChecked++;
        
        const startPos = match.index + 1; // +1 to skip the '<'
        const position = document.positionAt(startPos);
        
        console.log(`[VSCode Type Checking] Checking component: ${componentName} at position ${position.line}:${position.character}`);
        
        // Method 1: Check if it's a known styled component from AST analysis
        const isKnownStyledComponent = styledComponents.has(componentName);
        
        // Method 2: Get type information from VS Code's TypeScript service
        let isStyledComponentByType = false;
        if (options.detectImportedComponents) {
          const typeInfo = await this.getVSCodeTypeInformation(document, position);
          
          if (typeInfo) {
            console.log(`[VSCode Type Checking] ${componentName} type: ${typeInfo}`);
            isStyledComponentByType = this.isVSCodeTypeStyledComponent(typeInfo);
          } else {
            console.log(`[VSCode Type Checking] No type info available for ${componentName}`);
          }
        }
        
        if (isKnownStyledComponent || isStyledComponentByType) {
          console.log(`[VSCode Type Checking] ${componentName} is styled component: true (AST: ${isKnownStyledComponent}, Type: ${isStyledComponentByType})`);
          
          const token: EmotionToken = {
            line: position.line,
            character: position.character,
            length: componentName.length,
            tokenType: "emotionStyledComponent",
          };
          tokens.push(token);
        } else {
          console.log(`[VSCode Type Checking] ${componentName} is styled component: false`);
        }
      }
      
      return { tokens, stats };
    } catch (error) {
      console.error('[VSCode Type Checking] Error in VS Code type-based analysis:', error);
      return { tokens, stats };
    }
  }

  private isVSCodeTypeStyledComponent(typeInfo: string): boolean {
    // Since we now return 'StyledComponent' when the type definition is from @emotion/styled,
    // we just need to check if we got a result indicating it's a styled component
    return typeInfo === 'StyledComponent';
  }

  private async getTypeScriptService(document: vscode.TextDocument): Promise<{
    program: ts.Program | null;
    typeChecker: ts.TypeChecker | null;
  }> {
    try {
      // Get workspace folder to resolve tsconfig.json
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
      const rootPath = workspaceFolder?.uri.fsPath || vscode.workspace.rootPath;
      console.log(`[TypeScript Service] rootPath: ${rootPath}`);
      
      let compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowJs: true,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false,
        lib: ["ES2020", "DOM"],
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        // Override rootDir to allow analysis of files outside the main source directory
        rootDir: rootPath,
        // Add module resolution paths
        baseUrl: rootPath,
        paths: {
          "*": ["node_modules/*", "node_modules/@types/*"]
        },
        typeRoots: [
          rootPath + "/node_modules/@types",
          rootPath + "/node_modules"
        ]
      };

      // Try to read tsconfig.json from the workspace
      if (rootPath) {
        const tsconfigPath = ts.findConfigFile(rootPath, ts.sys.fileExists, 'tsconfig.json');
        if (tsconfigPath) {
          const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
          if (!configFile.error) {
            const parsedConfig = ts.parseJsonConfigFileContent(
              configFile.config,
              ts.sys,
              rootPath
            );
            if (!parsedConfig.errors.length) {
              compilerOptions = { 
                ...compilerOptions, 
                ...parsedConfig.options,
                // Always override rootDir to allow cross-file analysis
                rootDir: rootPath
              };
            }
          }
        }
      }

      // For cross-file type checking, we need to include related files
      // Start with the current file and try to find related files
      const filesToInclude = [document.fileName];
      
      // If this is a test file that imports from other files, try to include them
      const sourceCode = document.getText();
      const importMatches = sourceCode.match(/import.*from\s+['"]\.\/([^'"]+)['"]/g);
      if (importMatches && rootPath) {
        console.log(`[TypeScript Service] Found ${importMatches.length} import matches in ${document.fileName}`);
        for (const importMatch of importMatches) {
          const pathMatch = importMatch.match(/from\s+['"]\.\/([^'"]+)['"]/);
          if (pathMatch) {
            const relativePath = pathMatch[1];
            console.log(`[TypeScript Service] Trying to resolve import: ${relativePath}`);
            // Try common extensions
            const extensions = ['.tsx', '.ts', '.jsx', '.js'];
            for (const ext of extensions) {
              const fullPath = vscode.Uri.file(rootPath + '/' + relativePath + ext).fsPath;
              console.log(`[TypeScript Service] Checking if file exists: ${fullPath}`);
              try {
                const exists = ts.sys.fileExists(fullPath);
                console.log(`[TypeScript Service] File exists result: ${exists}`);
                if (exists) {
                  console.log(`[TypeScript Service] Found file: ${fullPath}`);
                  filesToInclude.push(fullPath);
                  break;
                } else {
                  console.log(`[TypeScript Service] File not found: ${fullPath}`);
                }
              } catch (e) {
                console.warn(`[TypeScript Service] Error checking file ${fullPath}:`, e);
              }
            }
          }
        }
      }

      console.log(`[TypeScript Service] Creating program with files: ${filesToInclude.join(', ')}`);
      
      // Create program with multiple files for cross-file resolution
      const program = ts.createProgram(filesToInclude, compilerOptions);
      const typeChecker = program.getTypeChecker();
      
      // Debug: check exports and imports resolution
      const programSourceFiles = program.getSourceFiles();
      programSourceFiles.forEach(sf => {
                if (sf.fileName.includes('test-type-checking.tsx')) {
          console.log(`[DEBUG] Checking ${sf.fileName}`);
          
          // Check imports
          sf.forEachChild(node => {
            if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
              const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
              console.log(`[DEBUG] Import: ${moduleSpecifier}`);
              
              if (moduleSpecifier === '@emotion/styled') {
                const moduleSymbol = typeChecker.getSymbolAtLocation(node.moduleSpecifier);
                console.log(`[DEBUG] @emotion/styled symbol: ${moduleSymbol ? 'found' : 'NOT FOUND'}`);
              }
            }
            
            // Check exports
            if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
              node.declarationList.declarations.forEach(decl => {
                if (ts.isIdentifier(decl.name) && decl.name.text === 'LocalContainer2') {
                  console.log(`[DEBUG] Found LocalContainer2 export at position: ${decl.getStart()}`);
                  const exportType = typeChecker.getTypeAtLocation(decl.name);
                  const exportTypeString = typeChecker.typeToString(exportType);
                  console.log(`[DEBUG] LocalContainer2 export type: "${exportTypeString}"`);
                }
              });
            }
          });
        }
        
        // Also check the importing file
        if (sf.fileName.includes('test-cross-file-type-checking.tsx')) {
          console.log(`[DEBUG] Checking importing file: ${sf.fileName}`);
          sf.forEachChild(node => {
            if (ts.isImportDeclaration(node) && node.importClause?.namedBindings) {
              if (ts.isNamedImports(node.importClause.namedBindings)) {
                node.importClause.namedBindings.elements.forEach(element => {
                  if (element.name.text === 'LocalContainer2') {
                    console.log(`[DEBUG] Found LocalContainer2 import`);
                    const importSymbol = typeChecker.getSymbolAtLocation(element.name);
                    console.log(`[DEBUG] Import symbol: ${importSymbol ? 'found' : 'NOT FOUND'}`);
                    if (importSymbol) {
                      const importType = typeChecker.getTypeOfSymbolAtLocation(importSymbol, element.name);  
                      const importTypeString = typeChecker.typeToString(importType);
                      console.log(`[DEBUG] Import type: "${importTypeString}"`);
                    }
                  }
                });
              }
            }
          });
        }
      });
      
      // Debug: show all source files in the program
      const sourceFiles = program.getSourceFiles();
      console.log(`[TypeScript Service] Program includes ${sourceFiles.length} source files:`);
      sourceFiles.forEach(sf => {
        if (!sf.fileName.includes('node_modules') && !sf.fileName.includes('lib.')) {
          console.log(`[TypeScript Service] - ${sf.fileName}`);
        }
      });
      
      // Check for any TypeScript errors
      const diagnostics = ts.getPreEmitDiagnostics(program);
      if (diagnostics.length > 0) {
        console.warn(`[TypeScript Service] Program has ${diagnostics.length} diagnostics`);
        diagnostics.slice(0, 5).forEach((diagnostic, index) => {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          const file = diagnostic.file ? diagnostic.file.fileName : 'unknown';
          const line = diagnostic.file && diagnostic.start 
            ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 
            : 'unknown';
          console.warn(`[TypeScript Service] ${index + 1}. ${file}:${line} - ${message}`);
        });
      }

      return { program, typeChecker };
    } catch (error) {
      console.warn("Failed to get TypeScript service:", error);
      return { program: null, typeChecker: null };
    }
  }

  private async findStyledComponentUsageWithTypes(
    document: vscode.TextDocument,
    sourceFile: ts.SourceFile,
    styledComponents: Set<string>,
    options: TypeCheckingOptions
  ): Promise<{
    tokens: EmotionToken[];
    stats: {
      totalChecked: number;
      cacheHits: number;
      cacheMisses: number;
    };
  }> {
    const tokens: EmotionToken[] = [];
    const stats = { totalChecked: 0, cacheHits: 0, cacheMisses: 0 };
    
    // Get TypeScript service
    const { typeChecker } = await this.getTypeScriptService(document);
    
    const visitNode = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxClosingElement(node)) {
        const tagName = node.tagName;
        if (ts.isIdentifier(tagName)) {
          stats.totalChecked++;
          
          // Method 1: Existing AST-based detection
          const isKnownStyledComponent = styledComponents.has(tagName.text);
          
          // Method 2: Type-based detection (only for opening/self-closing elements since closing elements don't have type info)
          let isStyledComponentByType = false;
          if (typeChecker && options.detectImportedComponents && !ts.isJsxClosingElement(node)) {
            const typeResult = this.checkStyledComponentType(
              node as ts.JsxOpeningElement | ts.JsxSelfClosingElement, 
              tagName, 
              typeChecker, 
              options.cacheTypeResults
            );
            isStyledComponentByType = typeResult.isStyledComponent;
            
            if (options.cacheTypeResults) {
              typeResult.detectionMethod === 'cache' ? stats.cacheHits++ : stats.cacheMisses++;
            }
          }
          
          if (isKnownStyledComponent || isStyledComponentByType) {
            const pos = sourceFile.getLineAndCharacterOfPosition(tagName.getStart());
            const token: EmotionToken = {
              line: pos.line,
              character: pos.character,
              length: tagName.text.length,
              tokenType: "emotionStyledComponent",
            };
            tokens.push(token);
            
            const method = isKnownStyledComponent && isStyledComponentByType ? 'both' :
                          isKnownStyledComponent ? 'ast' : 'type';
          }
        }
      }
      
      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
    
    return { tokens, stats };
  }

  private checkStyledComponentType(
    jsxNode: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
    tagName: ts.Identifier,
    typeChecker: ts.TypeChecker,
    useCache: boolean
  ): TypeCheckingResult {
    const cacheKey = `${tagName.text}-${jsxNode.getStart()}`;
    
    // Check cache first
    if (useCache && this.typeCache.has(cacheKey)) {
      const cached = this.typeCache.get(cacheKey)!;
      // Check if cache entry is still valid
      if (Date.now() - (cached as any).timestamp < this.TYPE_CACHE_DURATION) {
        return { ...cached, detectionMethod: 'cache' as any };
      }
    }

    try {
      // Get the type of the JSX element
      // For cross-file imports, we need to get the symbol first, then its type
      const tagSymbol = typeChecker.getSymbolAtLocation(tagName);
      let type: ts.Type;
      let typeString: string;
      
      if (tagSymbol) {
        // Get the type from the symbol (works better for cross-file imports)
        type = typeChecker.getTypeOfSymbolAtLocation(tagSymbol, tagName);
        typeString = typeChecker.typeToString(type);
        
        // Debug for LocalContainer2
        if (tagName.text === 'LocalContainer2') {
          console.log(`[DEBUG] Symbol-based lookup used`);
          console.log(`[DEBUG] Symbol name: ${tagSymbol.getName()}`);  
          console.log(`[DEBUG] Symbol flags: ${tagSymbol.flags}`);
          if (tagSymbol.valueDeclaration) {
            console.log(`[DEBUG] Symbol declared in: ${tagSymbol.valueDeclaration.getSourceFile().fileName}`);
          }
        }
      } else {
        // Fallback to direct type lookup
        type = typeChecker.getTypeAtLocation(tagName);
        typeString = typeChecker.typeToString(type);
        
        if (tagName.text === 'LocalContainer2') {
          console.log(`[DEBUG] Direct type lookup used (no symbol found)`);
        }
      }
      
      // Special debugging for LocalContainer2
      if (tagName.text === 'LocalContainer2') {
        console.log(`[DEBUG] LocalContainer2 detailed analysis:`);
        console.log(`[DEBUG] JSX element position: ${jsxNode.getStart()}-${jsxNode.getEnd()}`);
        console.log(`[DEBUG] Tag name position: ${tagName.getStart()}-${tagName.getEnd()}`);
        console.log(`[DEBUG] Type string: "${typeString}"`);
        console.log(`[DEBUG] Type flags: ${type.flags}`);
        console.log(`[DEBUG] Type symbol: ${type.getSymbol()?.getName() || 'none'}`);
        
        // Try to get the identifier separately
        const identifierSymbol = typeChecker.getSymbolAtLocation(tagName);
        console.log(`[DEBUG] Identifier symbol: ${identifierSymbol?.getName() || 'none'}`);
        if (identifierSymbol) {
          const identifierType = typeChecker.getTypeOfSymbolAtLocation(identifierSymbol, tagName);
          const identifierTypeString = typeChecker.typeToString(identifierType);
          console.log(`[DEBUG] Identifier type: "${identifierTypeString}"`);
        }
        
        // Try to get more detailed type information
        const symbol = type.getSymbol();
        if (symbol) {
          console.log(`[DEBUG] Symbol flags: ${symbol.flags}`);
          console.log(`[DEBUG] Symbol value declaration: ${symbol.valueDeclaration?.kind || 'none'}`);
          if (symbol.valueDeclaration) {
            const sourceFile = symbol.valueDeclaration.getSourceFile();
            console.log(`[DEBUG] Declared in: ${sourceFile.fileName}`);
          }
        }
        
        // Check if the type has StyledComponent characteristics
        console.log(`[DEBUG] Type string contains 'StyledComponent': ${typeString.includes('StyledComponent')}`);
        console.log(`[DEBUG] Type string contains 'emotion': ${typeString.includes('emotion')}`);
      }
      
             console.log(`[Type Checking] ${tagName.text} type: ${typeString}`);
       
       // Get symbol information for all components
       const symbol = type.getSymbol();
       if (symbol) {
         console.log(`[Type Checking] ${tagName.text} symbol: ${symbol.getName()}`);
         if (symbol.valueDeclaration) {
           const sourceFile = symbol.valueDeclaration.getSourceFile();
           console.log(`[Type Checking] ${tagName.text} declared in: ${sourceFile.fileName}`);
         }
       }
       
       // Check if it's a styled component type
      const isStyledComponent = this.isTypeStyledComponent(type, typeChecker);
      
      console.log(`[Type Checking] ${tagName.text} is styled component: ${isStyledComponent}`);
      
      const result: TypeCheckingResult = {
        isStyledComponent,
        confidence: isStyledComponent ? 'high' : 'low',
        detectionMethod: 'type',
      };
      
      // Cache the result
      if (useCache) {
        this.typeCache.set(cacheKey, { 
          ...result, 
          timestamp: Date.now() 
        } as any);
      }
      
      return result;
    } catch (error) {
      console.warn("Type checking failed for", tagName.text, error);
      return {
        isStyledComponent: false,
        confidence: 'low',
        detectionMethod: 'type',
      };
    }
  }

  private isTypeStyledComponent(type: ts.Type, typeChecker: ts.TypeChecker): boolean {
    try {
      // Get the symbol for this type
      const symbol = type.getSymbol();
      if (!symbol) return false;

      // Check if the type has StyledComponent characteristics
      // This is a heuristic approach since we can't easily check for exact StyledComponent interface
      
      // Method 1: Check if symbol name contains "Styled" 
      const symbolName = symbol.getName();
      if (symbolName.includes('Styled') || symbolName.includes('styled')) {
        return true;
      }

      // Method 2: Check type string representation
      const typeString = typeChecker.typeToString(type);
      if (typeString.includes('StyledComponent') || 
          typeString.includes('emotion') || 
          typeString.includes('styled-components')) {
        return true;
      }

      // Method 3: Check if it has typical styled component properties
      // Styled components typically have properties like 'withComponent', 'attrs', etc.
      const typeSymbol = type.getSymbol();
      if (typeSymbol) {
        const members = typeSymbol.members;
        if (members) {
          const hasStyledProps = ['withComponent', 'attrs', '__emotion_real'].some(
            prop => members.has(prop as ts.__String)
          );
          if (hasStyledProps) {
            return true;
          }
        }
      }

      // Method 4: Check for callable signatures that return JSX elements
      const signatures = typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
      if (signatures.length > 0) {
        const returnType = typeChecker.getReturnTypeOfSignature(signatures[0]);
        const returnTypeString = typeChecker.typeToString(returnType);
        if (returnTypeString.includes('JSX.Element') || returnTypeString.includes('ReactElement')) {
          // This could be a styled component - check if it came from emotion/styled-components
          return this.isTypeFromStyledLibrary(type, typeChecker);
        }
      }

      return false;
    } catch (error) {
      console.warn("Error checking styled component type:", error);
      return false;
    }
  }

  private isTypeFromStyledLibrary(type: ts.Type, typeChecker: ts.TypeChecker): boolean {
    try {
      const symbol = type.getSymbol();
      if (!symbol || !symbol.valueDeclaration) return false;

      // Try to get the source file of the symbol
      const sourceFile = symbol.valueDeclaration.getSourceFile();
      if (!sourceFile) return false;

      const fileName = sourceFile.fileName;
      
      // Check if it comes from emotion or styled-components modules
      return fileName.includes('@emotion/styled') || 
             fileName.includes('styled-components') ||
             fileName.includes('emotion');
    } catch (error) {
      return false;
    }
  }

  private getCacheKey(document: vscode.TextDocument): string {
    return `${document.uri.toString()}-${document.version}`;
  }

  private hasEmotionPatterns(text: string): boolean {
    return (
      EMOTION_IMPORT_PATTERNS.some((pattern) => text.includes(pattern)) ||
      text.includes("styled.") ||
      text.includes("styled(")
    );
  }

  private createSourceFile(document: vscode.TextDocument): ts.SourceFile {
    // Determine if this is a JSX/TSX file
    const isJsxFile = document.fileName.endsWith('.tsx') || 
                      document.fileName.endsWith('.jsx') ||
                      document.languageId === 'typescriptreact' ||
                      document.languageId === 'javascriptreact';
    
    return ts.createSourceFile(
      document.fileName,
      document.getText(),
      ts.ScriptTarget.Latest,
      true,
      isJsxFile ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
  }

  private analyzeImports(sourceFile: ts.SourceFile): ImportInfo {
    let hasEmotionImport = false;
    let hasStyledComponentsImport = false;
    let styledIdentifier = "styled";

    const visitImport = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          const moduleName = moduleSpecifier.text;

          if (moduleName === "@emotion/styled") {
            hasEmotionImport = true;
            styledIdentifier = this.extractStyledIdentifier(node) || "styled";
          } else if (moduleName === "styled-components") {
            hasStyledComponentsImport = true;
            styledIdentifier = this.extractStyledIdentifier(node) || "styled";
          }
        }
      }

      ts.forEachChild(node, visitImport);
    };

    visitImport(sourceFile);

    return {
      hasEmotionImport,
      hasStyledComponentsImport,
      styledIdentifier,
    };
  }

  private extractStyledIdentifier(
    importNode: ts.ImportDeclaration
  ): string | null {
    if (!importNode.importClause) return null;

    // Handle default import: import styled from '@emotion/styled'
    if (importNode.importClause.name) {
      return importNode.importClause.name.text;
    }

    // Handle named imports: import { styled as customStyled } from '@emotion/styled'
    if (
      importNode.importClause.namedBindings &&
      ts.isNamedImports(importNode.importClause.namedBindings)
    ) {
      for (const element of importNode.importClause.namedBindings.elements) {
        if (
          element.name.text === "styled" ||
          element.propertyName?.text === "styled"
        ) {
          return element.name.text;
        }
      }
    }

    return null;
  }

  private findStyledComponents(
    sourceFile: ts.SourceFile,
    importInfo: ImportInfo
  ): Set<string> {
    const styledComponents = new Set<string>();
    const styledIdentifier = importInfo.styledIdentifier;

    const visitNode = (node: ts.Node) => {
      // Look for variable declarations: const Button = styled.div`...`
      if (
        ts.isVariableDeclaration(node) &&
        node.name &&
        ts.isIdentifier(node.name)
      ) {
        const componentName = node.name.text;

        if (
          node.initializer &&
          this.isStyledCall(node.initializer, styledIdentifier)
        ) {
          styledComponents.add(componentName);
        }
      }

      // Look for function declarations that return styled components
      if (ts.isFunctionDeclaration(node) && node.name) {
        const functionName = node.name.text;
        if (
          node.body &&
          this.functionReturnsStyledComponent(node.body, styledIdentifier)
        ) {
          styledComponents.add(functionName);
        }
      }

      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
    return styledComponents;
  }

  private isStyledCall(node: ts.Expression, styledIdentifier: string): boolean {
    // Check for tagged template literals: styled.div`...` or styled('div')`...`
    if (ts.isTaggedTemplateExpression(node)) {
      return this.isStyledCall(node.tag, styledIdentifier);
    }

    // Check for styled.div, styled.button, etc.
    if (ts.isPropertyAccessExpression(node)) {
      return (
        ts.isIdentifier(node.expression) &&
        node.expression.text === styledIdentifier
      );
    }

    // Check for CallExpressions
    if (ts.isCallExpression(node)) {
      // Handle styled('div') or styled(Component) - direct call
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === styledIdentifier
      ) {
        return true;
      }

      // Handle styled.div({...}) - CallExpression with PropertyAccessExpression
      if (
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === styledIdentifier
      ) {
        return true;
      }

      // Handle styled('div')({...}) - nested CallExpression
      // The outer call has an inner call as its expression
      if (ts.isCallExpression(node.expression)) {
        return this.isStyledCall(node.expression, styledIdentifier);
      }
    }

    return false;
  }

  private functionReturnsStyledComponent(
    body: ts.Block,
    styledIdentifier: string
  ): boolean {
    // Simple check for return statements with styled calls
    for (const statement of body.statements) {
      if (ts.isReturnStatement(statement) && statement.expression) {
        if (this.isStyledCall(statement.expression, styledIdentifier)) {
          return true;
        }
      }
    }
    return false;
  }

  private findStyledComponentUsage(
    sourceFile: ts.SourceFile,
    styledComponents: Set<string>
  ): EmotionToken[] {
    const tokens: EmotionToken[] = [];
    const jsxElementsFound: string[] = [];
    
    const visitNode = (node: ts.Node) => {
      // Look for JSX elements that match our styled components
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxClosingElement(node)) {
        const tagName = node.tagName;
        if (ts.isIdentifier(tagName)) {
          jsxElementsFound.push(tagName.text);
          
          if (styledComponents.has(tagName.text)) {
            const pos = sourceFile.getLineAndCharacterOfPosition(
              tagName.getStart()
            );
            const token = {
              line: pos.line,
              character: pos.character,
              length: tagName.text.length,
              tokenType: "emotionStyledComponent" as const,
            };
            tokens.push(token);
          }
        }
      }

      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
    
    return tokens;
  }

  private logPerformanceMetrics(metrics: PerformanceMetrics): void {
    // Performance logging removed for production
  }

  public clearCache(): void {
    this.cache.clear();
    this.typeCache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public getTypeCacheSize(): number {
    return this.typeCache.size;
  }
}
