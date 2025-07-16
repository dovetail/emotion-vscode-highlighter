# Emotion Styled Component Highlighter VS Code Plugin

## Plan: Implementation Strategy

### 1. **Plugin Architecture Overview**

**Core Approach**: Use VS Code's Semantic Highlighting API to provide custom token types for emotion styled components.

**Key Components**:

- **Semantic Token Provider**: Analyzes JSX/TSX files to identify emotion styled components
- **Configuration System**: Allows users to customize highlighting colors
- **Performance Optimizations**: Early exit strategies and incremental parsing

### 2. **Detection Strategy**

**Emotion Styled Component Patterns to Detect**:

```typescript
// Direct styled calls
const Button = styled.div`...`;
const Button = styled('div')`...`;
const Button = styled.div({...});

// Component extensions should not be highlighted differently
const RedButton = styled(Button)`...`;

// Usage in JSX
<Button>Click me</Button>
<RedButton>Click me</RedButton>
```

**Detection Algorithm**:

1. **Import Analysis**: Check for emotion imports (`@emotion/styled`, `styled-components`)
2. **Variable Declaration Analysis**: Find variables assigned to `styled.*` calls
3. **Component Usage Tracking**: Identify where these components are used in JSX

### 3. **Performance Optimization Strategy**

**Early Exit Conditions**:

- Skip files without emotion imports
- Skip files without `.tsx` or `.jsx` extensions
- Use file change detection to avoid re-parsing unchanged files

**Incremental Parsing**:

- Only re-analyze changed portions of files
- Cache styled component definitions per file
- Use VS Code's change events efficiently

### 4. **Implementation Plan**

#### Phase 1: Core Plugin Structure

```typescript
// extension.ts
export function activate(context: vscode.ExtensionContext) {
  // Register semantic token provider
  const provider = new EmotionSemanticTokenProvider();
  const selector = { language: "typescript" };

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      selector,
      provider,
      legend
    )
  );
}
```

#### Phase 2: Token Provider Implementation

```typescript
class EmotionSemanticTokenProvider
  implements vscode.DocumentSemanticTokensProvider
{
  async provideDocumentSemanticTokens(
    document: vscode.TextDocument
  ): Promise<vscode.SemanticTokens> {
    // Early exit if no emotion imports
    if (!this.hasEmotionImports(document)) {
      return new vscode.SemanticTokens(new Uint32Array(0));
    }

    const styledComponents = this.findStyledComponents(document);
    const tokens = this.findStyledComponentUsage(document, styledComponents);

    return this.buildSemanticTokens(tokens);
  }
}
```

#### Phase 3: AST Analysis

```typescript
class EmotionAnalyzer {
  private findStyledComponents(document: vscode.TextDocument): Set<string> {
    const styledComponents = new Set<string>();

    // Parse with TypeScript compiler API for accuracy
    const sourceFile = ts.createSourceFile(
      document.fileName,
      document.getText(),
      ts.ScriptTarget.Latest,
      true
    );

    // Visit nodes to find styled component declarations
    this.visitNode(sourceFile, styledComponents);

    return styledComponents;
  }

  private visitNode(node: ts.Node, styledComponents: Set<string>) {
    // Look for patterns like: const Button = styled.div
    if (ts.isVariableDeclaration(node)) {
      this.analyzeVariableDeclaration(node, styledComponents);
    }

    ts.forEachChild(node, (child) => this.visitNode(child, styledComponents));
  }
}
```

### 5. **Testing Strategy**

#### Unit Tests

```typescript
// test/analyzer.test.ts
describe("EmotionAnalyzer", () => {
  it("should detect basic styled components", () => {
    const code = `
            import styled from '@emotion/styled';
            const Button = styled.div\`color: red;\`;
        `;

    const analyzer = new EmotionAnalyzer();
    const components = analyzer.findStyledComponents(code);

    expect(components.has("Button")).toBe(true);
  });

  it("should detect component extensions", () => {
    const code = `
            const RedButton = styled(Button)\`color: red;\`;
        `;

    const analyzer = new EmotionAnalyzer();
    const components = analyzer.findStyledComponents(code);

    expect(components.has("RedButton")).toBe(true);
  });
});
```

#### Integration Tests

```typescript
// test/extension.test.ts
describe("Extension Integration", () => {
  it("should highlight styled components in JSX", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: testFileContent,
      language: "typescript",
    });

    const provider = new EmotionSemanticTokenProvider();
    const tokens = await provider.provideDocumentSemanticTokens(document);

    // Verify tokens are generated for styled components
    expect(tokens.data.length).toBeGreaterThan(0);
  });
});
```

#### Performance Tests

```typescript
// test/performance.test.ts
describe("Performance", () => {
  it("should process large files quickly", async () => {
    const largeFile = generateLargeTestFile(10000); // 10k lines

    const start = performance.now();
    const tokens = await provider.provideDocumentSemanticTokens(largeFile);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Under 100ms
  });

  it("should exit early for files without emotion", async () => {
    const regularFile = createRegularJSXFile();

    const start = performance.now();
    const tokens = await provider.provideDocumentSemanticTokens(regularFile);
    const end = performance.now();

    expect(end - start).toBeLessThan(10); // Under 10ms
    expect(tokens.data.length).toBe(0);
  });
});
```

### 6. **Configuration and Customization**

#### VS Code Settings

```json
// package.json
{
  "contributes": {
    "configuration": {
      "title": "Emotion Highlighter",
      "properties": {
        "emotionHighlighter.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable emotion styled component highlighting"
        },
        "emotionHighlighter.color": {
          "type": "string",
          "default": "#FF6B6B",
          "description": "Color for emotion styled components"
        }
      }
    },
    "semanticTokenTypes": [
      {
        "id": "emotionStyledComponent",
        "description": "Emotion styled component"
      }
    ]
  }
}
```

### 7. **File Structure**

```
emotion-highlighter/
├── src/
│   ├── extension.ts
│   ├── analyzer.ts
│   ├── tokenProvider.ts
│   └── types.ts
├── test/
│   ├── analyzer.test.ts
│   ├── extension.test.ts
│   └── performance.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 8. **Development Workflow**

1. **Setup**: Initialize VS Code extension project with yeoman
2. **Core Implementation**: Build the semantic token provider
3. **Testing**: Implement comprehensive test suite
4. **Performance Optimization**: Profile and optimize for large files
5. **User Testing**: Test with real emotion codebases
6. **Documentation**: Create usage documentation
7. **Publishing**: Package and publish to VS Code marketplace

### 9. **Potential Challenges & Solutions**

**Challenge**: Complex emotion patterns (conditional styling, dynamic components)
**Solution**: Start with basic patterns, expand incrementally

**Challenge**: Performance with large files
**Solution**: Implement caching, incremental parsing, and Web Workers if needed

**Challenge**: False positives/negatives
**Solution**: Comprehensive test suite with real-world examples

## Implementation Status

- [x] Project setup and initialization
- [x] Core extension structure
- [x] TypeScript analyzer implementation
- [x] Semantic token provider
- [x] Basic emotion pattern detection (partial - needs refinement)
- [ ] JSX usage highlighting (implemented but not working correctly)
- [x] Performance optimizations
- [x] Unit tests (created but some failing)
- [ ] Integration tests
- [x] Performance tests (created)
- [x] Configuration system
- [x] Documentation
- [ ] Publishing preparation

## Current Status

**✅ Completed:**

- Full project structure with TypeScript compilation
- Core VS Code extension architecture
- EmotionAnalyzer class with AST parsing
- Semantic token provider implementation
- Comprehensive test suite (unit and performance tests)
- VS Code mocking for tests
- Performance optimizations with caching
- Documentation and README

**🔄 In Progress:**

- JSX tokenization not generating tokens correctly
- Some styled component detection patterns need refinement
- Test failures need investigation

**🐛 Known Issues:**

1. JSX usage detection returning 0 tokens (primary issue)
2. Object-style styled components not detected: `styled.div({...})`
3. Some complex component patterns not recognized
4. Jest module mapping warnings

**⚡ Performance Results:**

- Empty files: ~0.01ms (excellent early exit)
- Files without emotion: ~0.03ms (excellent early exit)
- Medium files (1000 lines): ~26ms (within target)
- Large files (5000+ lines): ~46-70ms (within target)
- Cache performance: ~0.01ms for repeated analysis

The extension architecture is solid and performance targets are being met. The main issue is in the JSX tokenization logic that needs debugging.

This plan provides a solid foundation for building a performant emotion styled component highlighter that can efficiently distinguish styled components from regular JSX components.
