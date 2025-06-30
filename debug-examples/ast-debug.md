# AST Debugging Guide

## Add this to analyzer.ts for AST debugging:

```typescript
// Add this helper method to EmotionAnalyzer class
private debugNode(node: ts.Node, depth = 0): void {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${ts.SyntaxKind[node.kind]}: ${node.getText().slice(0, 50)}...`);
  
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    console.log(`${indent}  JSX ELEMENT FOUND!`);
    if (ts.isIdentifier(node.tagName)) {
      console.log(`${indent}  Tag name: ${node.tagName.text}`);
    }
  }
  
  if (depth < 3) { // Limit depth to avoid spam
    ts.forEachChild(node, child => this.debugNode(child, depth + 1));
  }
}

// Call this in findStyledComponentUsage:
// this.debugNode(sourceFile);
```

## Common Issues to Check:

1. **File Language Detection**: Ensure VSCode recognizes file as TSX/JSX
2. **Import Resolution**: Check if emotion imports are properly detected
3. **Component Detection**: Verify styled components are found correctly
4. **JSX Parsing**: Confirm TypeScript can parse JSX syntax
5. **Semantic Token Registration**: Ensure tokens are properly registered

## Test Cases to Try:

1. Simple: `const Btn = styled.button``; <Btn>test</Btn>`
2. Self-closing: `<Btn />`
3. With props: `<Btn color="red">test</Btn>`
4. Nested: `<Container><Btn>test</Btn></Container>`
5. Mixed with HTML: `<div><Btn>test</Btn><button>regular</button></div>` 