const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'vscode') {
    return require('./out/test/__mocks__/vscode');
  }
  return originalRequire.apply(this, arguments);
};

const { EmotionAnalyzer } = require('./out/src/analyzer');
const vscode = require('./out/test/__mocks__/vscode');

class MockDocument {
  constructor(content) {
    this.fileName = 'test.tsx';
    this.uri = vscode.Uri.file('test.tsx');
    this.languageId = 'typescriptreact';
    this.version = 1;
    this._content = content;
  }
  getText() { return this._content; }
}

async function test() {
  const analyzer = new EmotionAnalyzer();
  const code = `import styled from '@emotion/styled';
const Button = styled.div\`color: red;\`;
const App = () => <Button>Test</Button>;`;
  
  console.log('Testing code:');
  console.log(code);
  console.log('\n');
  
  const doc = new MockDocument(code);
  const result = await analyzer.analyze(doc);
  
  console.log('Analysis result:');
  console.log('- Styled components found:', Array.from(result.styledComponents));
  console.log('- Import info:', result.importInfo);
  console.log('- Tokens:', result.tokens.length);
  console.log('- Token details:', result.tokens);
}

test().catch(console.error); 