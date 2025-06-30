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
    vscode.window.showInformationMessage("🚀 ANALYZER CONSTRUCTOR START");
    
    try {
      vscode.window.showInformationMessage("🔨 Analyzer: Step A - Starting initialization");
      
      vscode.window.showInformationMessage("🔨 Analyzer: Step B - Testing TypeScript import");
      if (!ts) {
        throw new Error("TypeScript module not available");
      }
      vscode.window.showInformationMessage("✅ Analyzer: Step B - TypeScript available");
      
      vscode.window.showInformationMessage("🔨 Analyzer: Step C - Testing basic TS functionality");
      const testTarget = ts.ScriptTarget.Latest;
      vscode.window.showInformationMessage(`✅ Analyzer: Step C - TS ScriptTarget: ${testTarget}`);
      
      vscode.window.showInformationMessage("🔨 Analyzer: Step D - Initialization complete");
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Analyzer: Initialization failed at: ${error}`);
      throw error;
    }
    
    vscode.window.showInformationMessage("🎉 ANALYZER CONSTRUCTOR END");
  }

  public async analyze(document: vscode.TextDocument): Promise<ExtendedAnalysisResult> {
    const startTime = performance.now();
    
    vscode.window.showInformationMessage(`📋 ANALYZER: Starting analysis for ${document.fileName.split('/').pop()}`);

    // Check cache first
    const cacheKey = this.getCacheKey(document);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      vscode.window.showInformationMessage('💾 Using cached result');
      return cached.result;
    }

    // Get configuration for type checking
    const typeCheckingOptions = this.getTypeCheckingOptions();
    
    // Early exit if file doesn't contain emotion patterns
    const text = document.getText();
    if (!this.hasEmotionPatterns(text)) {
      vscode.window.showInformationMessage('❌ No emotion patterns found in file');
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
    
    vscode.window.showInformationMessage('✅ Emotion patterns found, proceeding with analysis');

    const parseStartTime = performance.now();
    const sourceFile = this.createSourceFile(document);
    const parseTime = performance.now() - parseStartTime;

    const analysisStartTime = performance.now();
    const importInfo = this.analyzeImports(sourceFile);

    if (!importInfo.hasEmotionImport && !importInfo.hasStyledComponentsImport) {
      vscode.window.showInformationMessage('❌ No emotion/styled-components imports found');
      const emptyResult: ExtendedAnalysisResult = {
        styledComponents: new Set(),
        importInfo,
        tokens: [],
        typeCheckingEnabled: typeCheckingOptions.enabled,
      };

      this.cache.set(cacheKey, { result: emptyResult, timestamp: Date.now() });
      return emptyResult;
    }
    
    vscode.window.showInformationMessage(`✅ Found imports: emotion=${importInfo.hasEmotionImport}, styled-components=${importInfo.hasStyledComponentsImport}`);

    const styledComponents = this.findStyledComponents(sourceFile, importInfo);
    const analysisTime = performance.now() - analysisStartTime;

    vscode.window.showInformationMessage(`🎯 Found ${styledComponents.size} styled components: ${Array.from(styledComponents).join(', ')}`);

    const tokenizationStartTime = performance.now();
    let tokens: EmotionToken[] = [];
    let typeCheckingTime = 0;
    let typeCheckingStats = undefined;

    // Enhanced token finding with type checking
    if (typeCheckingOptions.enabled) {
      const typeCheckingStartTime = performance.now();
      const enhancedResult = await this.findStyledComponentUsageWithTypes(
        document,
        sourceFile, 
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
    
    vscode.window.showInformationMessage(`🎉 Analysis complete! Generated ${tokens.length} tokens`);

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

  private async getTypeScriptService(document: vscode.TextDocument): Promise<{
    program: ts.Program | null;
    typeChecker: ts.TypeChecker | null;
  }> {
    try {
      // Try to get TypeScript service from VSCode
      // This is a simplified approach - in production, we'd want to use
      // the actual Language Server Protocol or VSCode's TypeScript service
      
      // For now, we'll create our own program from the document
      // This is less ideal but works as a starting point
      const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowJs: true,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false,
      };

      // Create program with the current file
      const program = ts.createProgram([document.fileName], compilerOptions);
      const typeChecker = program.getTypeChecker();

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
    
    vscode.window.showInformationMessage(`🔍 Enhanced JSX analysis - TypeChecker: ${typeChecker ? 'Available' : 'Not Available'}`);

    const visitNode = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = node.tagName;
        if (ts.isIdentifier(tagName)) {
          stats.totalChecked++;
          
          // Method 1: Existing AST-based detection
          const isKnownStyledComponent = styledComponents.has(tagName.text);
          
          // Method 2: Type-based detection
          let isStyledComponentByType = false;
          if (typeChecker && options.detectImportedComponents) {
            const typeResult = this.checkStyledComponentType(
              node, 
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
            vscode.window.showInformationMessage(`✅ Found styled component: ${tagName.text} (${method})`);
          }
        }
      }
      
      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
    
    vscode.window.showInformationMessage(`🏷️ Enhanced analysis complete: ${tokens.length} tokens, ${stats.totalChecked} checked`);
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
      const type = typeChecker.getTypeAtLocation(tagName);
      
      // Check if it's a styled component type
      const isStyledComponent = this.isTypeStyledComponent(type, typeChecker);
      
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
    
    vscode.window.showInformationMessage(`🔍 Looking for JSX usage of: ${Array.from(styledComponents).join(', ')}`);

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
    
    vscode.window.showInformationMessage(`🏷️ JSX elements found: ${jsxElementsFound.join(', ')} | Tokens: ${tokens.length}`);
    return tokens;
  }

  private logPerformanceMetrics(metrics: PerformanceMetrics): void {
    // Only log if performance is concerning
    if (metrics.totalTime > 50) {
      const logData: any = {
        parseTime: `${metrics.parseTime.toFixed(2)}ms`,
        analysisTime: `${metrics.analysisTime.toFixed(2)}ms`,
        tokenizationTime: `${metrics.tokenizationTime.toFixed(2)}ms`,
        totalTime: `${metrics.totalTime.toFixed(2)}ms`,
      };
      
      if (metrics.typeCheckingTime !== undefined) {
        logData.typeCheckingTime = `${metrics.typeCheckingTime.toFixed(2)}ms`;
      }
      
      console.log("Emotion Analyzer Performance:", logData);
    }
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
