const fs = require('fs');
const path = require('path');

// Use the existing vscode mock
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'vscode') {
    return require('./test/__mocks__/vscode');
  }
  return originalRequire.apply(this, arguments);
};

// Now require the analyzer
const { EmotionAnalyzer } = require('./out/src/analyzer');
const vscode = require('./test/__mocks__/vscode');

// Mock document
class MockDocument {
  constructor(filePath, content) {
    this.fileName = filePath;
    this.uri = vscode.Uri.file(filePath);
    this.languageId = 'typescriptreact';
    this.version = 1;
    this._content = content;
  }

  getText() {
    return this._content;
  }
}

async function testCrossFileTypeChecking() {
  console.log('🧪 Testing cross-file type checking...');
  
  try {
    const analyzer = new EmotionAnalyzer();
    
    // Read the test files
    const testCrossFileContent = fs.readFileSync('test-cross-file-type-checking.tsx', 'utf8');
    const testTypeCheckingContent = fs.readFileSync('test-type-checking.tsx', 'utf8');
    
    console.log('\n📄 Test file content:');
    console.log('test-cross-file-type-checking.tsx:');
    console.log(testCrossFileContent);
    
    console.log('\n📄 Imported file content (relevant parts):');
    const exportLine = testTypeCheckingContent.split('\n').find(line => line.includes('export const LocalContainer2'));
    console.log(exportLine);
    
    // Create mock document for the cross-file test
    const document = new MockDocument(
      path.join(__dirname, 'test-cross-file-type-checking.tsx'),
      testCrossFileContent
    );
    
    console.log('\n🔍 Analyzing with type checking enabled...');
    const result = await analyzer.analyze(document);
    
    console.log('\n📊 Analysis Results:');
    console.log('- Type checking enabled:', result.typeCheckingEnabled);
    console.log('- Styled components found:', Array.from(result.styledComponents));
    console.log('- Tokens found:', result.tokens.length);
    
    if (result.tokens.length > 0) {
      console.log('\n🎯 Tokens details:');
      result.tokens.forEach((token, index) => {
        console.log(`  ${index + 1}. Line ${token.line + 1}, Column ${token.character + 1}: "${token.tokenType}" (length: ${token.length})`);
      });
    }
    
    if (result.typeCheckingStats) {
      console.log('\n📈 Type checking stats:');
      console.log('- Total checked:', result.typeCheckingStats.totalChecked);
      console.log('- Cache hits:', result.typeCheckingStats.cacheHits);
      console.log('- Cache misses:', result.typeCheckingStats.cacheMisses);
    }
    
    // Check if LocalContainer2 was detected
    const hasLocalContainer2Token = result.tokens.some(token => {
      const line = testCrossFileContent.split('\n')[token.line];
      return line && line.includes('LocalContainer2');
    });
    
    console.log('\n✅ Cross-file detection result:');
    console.log('- LocalContainer2 detected:', hasLocalContainer2Token ? '✅ YES' : '❌ NO');
    
    if (hasLocalContainer2Token) {
      console.log('\n🎉 SUCCESS: Cross-file styled component detection is working!');
    } else {
      console.log('\n⚠️ ISSUE: Cross-file styled component was not detected.');
      console.log('This might indicate that type checking needs further improvements.');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Compile TypeScript first, then run test
const { spawn } = require('child_process');

console.log('📦 Compiling TypeScript...');
const tsc = spawn('npx', ['tsc'], { stdio: 'inherit' });

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TypeScript compilation successful\n');
    testCrossFileTypeChecking();
  } else {
    console.error('❌ TypeScript compilation failed');
  }
}); 