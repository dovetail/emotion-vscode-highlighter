import * as vscode from "vscode";
import { EmotionAnalyzer } from "../src/analyzer";
import * as fs from "fs";
import * as path from "path";

// Mock TextDocument for cross-file testing
class CrossFileTestDocument implements vscode.TextDocument {
  public uri: vscode.Uri;
  public fileName: string;
  public isUntitled: boolean = false;
  public languageId: string;
  public version: number = 1;
  public isDirty: boolean = false;
  public isClosed: boolean = false;
  public eol: vscode.EndOfLine = vscode.EndOfLine.LF;
  public lineCount: number;
  public encoding: string = "utf8";

  constructor(private content: string, filename: string = "test-cross-file-type-checking.tsx") {
    this.languageId = "typescriptreact";
    this.fileName = path.resolve(filename);
    this.uri = vscode.Uri.file(this.fileName);
    this.lineCount = content.split("\n").length;
  }

  getText(range?: vscode.Range): string {
    if (!range) return this.content;
    
    const start = this.offsetAt(range.start);
    const end = this.offsetAt(range.end);
    return this.content.substring(start, end);
  }

  getWordRangeAtPosition(position: vscode.Position): vscode.Range | undefined {
    return undefined;
  }

  lineAt(line: number | vscode.Position): vscode.TextLine {
    if (typeof line === 'object') {
      line = line.line;
    }
    const lines = this.content.split('\n');
    const text = lines[line] || '';
    return {
      lineNumber: line,
      text: text,
      range: new vscode.Range(line, 0, line, text.length),
      rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
      firstNonWhitespaceCharacterIndex: text.search(/\S/),
      isEmptyOrWhitespace: text.trim().length === 0
    };
  }

  offsetAt(position: vscode.Position): number {
    const lines = this.content.split('\n');
    let offset = 0;
    for (let i = 0; i < position.line; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    return offset + position.character;
  }

  positionAt(offset: number): vscode.Position {
    const lines = this.content.split('\n');
    let currentOffset = 0;
    for (let line = 0; line < lines.length; line++) {
      if (currentOffset + lines[line].length >= offset) {
        return new vscode.Position(line, offset - currentOffset);
      }
      currentOffset += lines[line].length + 1;
    }
    return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
  }

  validateRange(range: vscode.Range): vscode.Range {
    return range;
  }

  validatePosition(position: vscode.Position): vscode.Position {
    return position;
  }

  save(): Thenable<boolean> {
    return Promise.resolve(true);
  }
}

describe("Cross-file Type Checking Tests", () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  it("should detect imported styled components from other files", async () => {
    // Read the actual test file content
    const testCrossFileContent = `import React from 'react';
import { LocalContainer2 } from './test-type-checking';

const Component = () => {
  return <div><LocalContainer2 /></div>;
};

export default Component;
`;

    const document = new CrossFileTestDocument(
      testCrossFileContent,
      path.join(process.cwd(), "test-cross-file-type-checking.tsx")
    );

    console.log("🔍 Analyzing cross-file import for LocalContainer2...");
    const result = await analyzer.analyze(document);

    console.log("📊 Analysis Results:");
    console.log("- Type checking enabled:", result.typeCheckingEnabled);
    console.log("- Styled components found (AST):", Array.from(result.styledComponents));
    console.log("- Tokens found:", result.tokens.length);

    if (result.typeCheckingStats) {
      console.log("📈 Type checking stats:");
      console.log("- Total checked:", result.typeCheckingStats.totalChecked);
      console.log("- Cache hits:", result.typeCheckingStats.cacheHits);
      console.log("- Cache misses:", result.typeCheckingStats.cacheMisses);
    }

    if (result.tokens.length > 0) {
      console.log("🎯 Tokens details:");
      result.tokens.forEach((token, index) => {
        const line = testCrossFileContent.split('\n')[token.line];
        console.log(`  ${index + 1}. Line ${token.line + 1}, Col ${token.character + 1}: "${token.tokenType}" in "${line?.trim()}"`);
      });
    }

    // Check if LocalContainer2 was detected
    const hasLocalContainer2Token = result.tokens.some(token => {
      const line = testCrossFileContent.split('\n')[token.line];
      return line && line.includes('LocalContainer2');
    });

    console.log("✅ Cross-file detection result:");
    console.log("- LocalContainer2 detected:", hasLocalContainer2Token ? "✅ YES" : "❌ NO");

    // The test should pass if either AST-based detection OR type-based detection works
    // AST-based detection won't work for cross-file imports, but type-based should
    expect(result.tokens.length).toBeGreaterThan(0);
    expect(hasLocalContainer2Token).toBe(true);
  });

  it("should have type checking enabled by default", async () => {
    const simpleContent = `import React from 'react';
const Component = () => <div>Test</div>;`;

    const document = new CrossFileTestDocument(simpleContent);
    const result = await analyzer.analyze(document);

    expect(result.typeCheckingEnabled).toBe(true);
  });

  it("should provide type checking statistics when enabled", async () => {
    const testContent = `import React from 'react';
import { LocalContainer2 } from './test-type-checking';

const Component = () => {
  return <div><LocalContainer2 /></div>;
};`;

    const document = new CrossFileTestDocument(testContent);
    const result = await analyzer.analyze(document);

    if (result.typeCheckingEnabled) {
      expect(result.typeCheckingStats).toBeDefined();
      expect(result.typeCheckingStats!.totalChecked).toBeGreaterThan(0);
    }
  });
}); 