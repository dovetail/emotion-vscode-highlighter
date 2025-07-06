import * as ts from "typescript";
import * as vscode from "vscode";
import {
  EmotionToken,
  ImportInfo,
  TypeCheckingOptions, 
  ExtendedAnalysisResult
} from "./types";

export class EmotionAnalyzer {
  private cache = new Map<
    string,
    { result: ExtendedAnalysisResult; timestamp: number }
  >();
  private readonly CACHE_DURATION = 30000; // 30 seconds

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

    const text = document.getText();
    const typeCheckingOptions = this.getTypeCheckingOptions();
    
    // OPTIMIZATION 1: Fast JSX check - exit immediately if no JSX elements
    if (!this.hasJSXElements(text)) {
      console.log(`[Analyzer] Early exit: no JSX elements found`);
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

    // OPTIMIZATION 2: Use optimized single-pass analysis for all files 
    const lines = text.split('\n').length;
    console.log(`[Analyzer] Using optimized single-pass analysis (${lines} lines)`);
    const result = await this.analyzeRegular(document);

    // OPTIMIZATION 3: Early exit after single-pass if no styled components or imports found
    if (!typeCheckingOptions.enabled && 
        result.styledComponents.size === 0 && 
        !result.importInfo.hasEmotionImport && 
        !result.importInfo.hasStyledComponentsImport) {
      console.log(`[Analyzer] Early exit: no styled components or emotion imports found`);
      
      // Return minimal result for better performance
      const minimalResult: ExtendedAnalysisResult = {
        styledComponents: new Set(),
        importInfo: result.importInfo,
        tokens: [],
        typeCheckingEnabled: typeCheckingOptions.enabled,
      };
      this.cache.set(cacheKey, { result: minimalResult, timestamp: Date.now() });
      return minimalResult;
    }
    
    // Cache the result
    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    const totalTime = performance.now() - startTime;
    console.log(`[Analyzer] Total analysis time: ${totalTime.toFixed(2)}ms for ${lines} lines`);

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
      
      // Find JSX elements using regex (both opening and closing tags)
      const jsxRegex = /<(\/?)?(\w+)(?:\s[^>]*)?\s*\/?>/g;
      let match;
      
      while ((match = jsxRegex.exec(text)) !== null) {
        const isClosing = match[1] === '/';
        const componentName = match[2];
        
        // Skip HTML elements (start with lowercase)
        if (componentName[0].toLowerCase() === componentName[0]) {
          continue;
        }
        
        stats.totalChecked++;
        
        // Calculate position of the component name (skip '<' and optional '/')
        const startPos = match.index + 1 + (isClosing ? 1 : 0); // +1 for '<', +1 more for '/' if closing
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

  private getCacheKey(document: vscode.TextDocument): string {
    return `${document.uri.toString()}-${document.version}`;
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
    
    const visitNode = (node: ts.Node) => {
      // Look for JSX elements that match our styled components
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxClosingElement(node)) {
        const tagName = node.tagName;
        if (ts.isIdentifier(tagName)) {
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

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public getTypeCacheSize(): number {
    return 0; // No type cache used in current implementation
  }

  /**
   * OPTIMIZATION: Single-pass AST analysis that combines all analysis steps
   * This replaces multiple separate traversals with one efficient pass
   */
  private analyzeSinglePass(sourceFile: ts.SourceFile): {
    importInfo: ImportInfo;
    styledComponents: Set<string>;
    jsxElements: Array<{ tagName: string; node: ts.JsxOpeningElement | ts.JsxSelfClosingElement | ts.JsxClosingElement }>;
    hasJSX: boolean;
  } {
    // Pre-allocate collections for better performance
    const styledComponents = new Set<string>();
    const jsxElements: Array<{ tagName: string; node: ts.JsxOpeningElement | ts.JsxSelfClosingElement | ts.JsxClosingElement }> = [];
    
    let hasEmotionImport = false;
    let hasStyledComponentsImport = false;
    let styledIdentifier = "styled";
    let hasJSX = false;

    // Single optimized traversal with early termination opportunities
    const visitNode = (node: ts.Node): boolean => {
      // OPTIMIZATION: Early node type filtering
      const nodeKind = node.kind;
      
      // Skip nodes we don't care about for performance
      if (this.shouldSkipNode(nodeKind)) {
        return false; // Don't traverse children
      }

      // Process import declarations
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
      
      // Process styled component variable declarations
      else if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
        if (node.initializer && this.isStyledCall(node.initializer, styledIdentifier)) {
          styledComponents.add(node.name.text);
        }
      }
      
      // Process function declarations that return styled components
      else if (ts.isFunctionDeclaration(node) && node.name) {
        if (node.body && this.functionReturnsStyledComponent(node.body, styledIdentifier)) {
          styledComponents.add(node.name.text);
        }
      }
      
      // Process JSX elements
      else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxClosingElement(node)) {
        hasJSX = true;
        const tagName = node.tagName;
        if (ts.isIdentifier(tagName)) {
          jsxElements.push({ tagName: tagName.text, node });
        }
      }

      return true; // Continue traversal
    };

    // Perform traversal
    const traverse = (currentNode: ts.Node): void => {
      if (!visitNode(currentNode)) {
        return; // Skip this subtree
      }

      // Continue traversing children
      ts.forEachChild(currentNode, traverse);
    };

    traverse(sourceFile);

    return {
      importInfo: {
        hasEmotionImport,
        hasStyledComponentsImport,  
        styledIdentifier,
      },
      styledComponents,
      jsxElements,
      hasJSX,
    };
  }

  /**
   * OPTIMIZATION: Skip irrelevant AST nodes early for performance
   */
  private shouldSkipNode(nodeKind: ts.SyntaxKind): boolean {
    // Skip nodes that definitely don't contain what we're looking for
    switch (nodeKind) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.BigIntLiteral:
      case ts.SyntaxKind.RegularExpressionLiteral:
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      case ts.SyntaxKind.TrueKeyword:
      case ts.SyntaxKind.FalseKeyword:
      case ts.SyntaxKind.NullKeyword:
      case ts.SyntaxKind.UndefinedKeyword:
      case ts.SyntaxKind.ThisKeyword:
      case ts.SyntaxKind.SuperKeyword:
        return true;
      default:
        return false;
    }
  }

  /**
   * OPTIMIZATION: Fast JSX-only check using regex (much faster than AST parsing)
   */
  private hasJSXElements(text: string): boolean {
    // Pre-compiled regex patterns for better performance
    return this.jsxElementRegex.test(text);
  }

  // Pre-compiled regex patterns (class-level for reuse)
  private readonly jsxElementRegex = /<\w+(?:\s[^>]*)?\s*\/?>/;

  private generateTokensFromJSXElements(
    jsxElements: Array<{ tagName: string; node: ts.JsxOpeningElement | ts.JsxSelfClosingElement | ts.JsxClosingElement }>,
    styledComponents: Set<string>,
    sourceFile: ts.SourceFile
  ): EmotionToken[] {
    const tokens: EmotionToken[] = [];
    
    for (const { tagName, node } of jsxElements) {
      // OPTIMIZATION: Direct Set.has() lookup is O(1)
      if (styledComponents.has(tagName)) {
        const tagNameNode = node.tagName;
        if (ts.isIdentifier(tagNameNode)) {
          const pos = sourceFile.getLineAndCharacterOfPosition(tagNameNode.getStart());
          tokens.push({
            line: pos.line,
            character: pos.character,
            length: tagName.length,
            tokenType: "emotionStyledComponent",
          });
        }
      }
    }
    
    return tokens;
  }

  /**
   * OPTIMIZATION: Regular analysis method that uses single-pass optimization
   */
  private async analyzeRegular(document: vscode.TextDocument): Promise<ExtendedAnalysisResult> {
    const sourceFile = this.createSourceFile(document);
    const singlePassResult = this.analyzeSinglePass(sourceFile);
    
    const typeCheckingOptions = this.getTypeCheckingOptions();
    let tokens: EmotionToken[] = [];
    let typeCheckingStats = undefined;

    if (typeCheckingOptions.enabled) {
      const enhancedResult = await this.findStyledComponentUsageWithVSCodeTypes(
        document,
        singlePassResult.styledComponents,
        typeCheckingOptions
      );
      tokens = enhancedResult.tokens;
      typeCheckingStats = enhancedResult.stats;
    } else {
      tokens = this.generateTokensFromJSXElements(
        singlePassResult.jsxElements,
        singlePassResult.styledComponents,
        sourceFile
      );
    }

    return {
      styledComponents: singlePassResult.styledComponents,
      importInfo: singlePassResult.importInfo,
      tokens,
      typeCheckingEnabled: typeCheckingOptions.enabled,
      typeCheckingStats,
    };
  }
}
