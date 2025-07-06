import * as vscode from "vscode";
import { EmotionAnalyzer } from "../src/analyzer";

// Mock TextDocument for testing
class MockTextDocument implements vscode.TextDocument {
  public uri!: vscode.Uri;
  public fileName!: string;
  public isUntitled!: boolean;
  public languageId!: string;
  public version!: number;
  public isDirty!: boolean;
  public isClosed!: boolean;
  public eol!: vscode.EndOfLine;
  public lineCount!: number;
  public encoding!: string;

  constructor(private content: string, language: string = "typescript") {
    this.languageId = language;
    this.version = 1;
    this.fileName = `test.${language === "typescript" ? "ts" : "js"}`;
    this.uri = vscode.Uri.file(this.fileName);
    this.lineCount = content.split("\n").length;
    this.isDirty = false;
    this.isClosed = false;
    this.isUntitled = false;
    this.eol = vscode.EndOfLine.LF;
    this.encoding = "utf8";
  }

  getText(): string {
    return this.content;
  }

  save(): Thenable<boolean> {
    return Promise.resolve(true);
  }

  lineAt(line: number | vscode.Position): vscode.TextLine {
    const lines = this.content.split("\n");
    const lineNumber = typeof line === "number" ? line : line.line;
    const text = lines[lineNumber] || "";
    return {
      lineNumber,
      text,
      range: new vscode.Range(lineNumber, 0, lineNumber, text.length),
      rangeIncludingLineBreak: new vscode.Range(lineNumber, 0, lineNumber + 1, 0),
      firstNonWhitespaceCharacterIndex: text.search(/\S/),
      isEmptyOrWhitespace: text.trim().length === 0,
    };
  }

  offsetAt(position: vscode.Position): number {
    const lines = this.content.split("\n"); 
    let offset = 0;
    for (let i = 0; i < position.line; i++) {
      offset += lines[i].length + 1;
    }
    return offset + position.character;
  }

  positionAt(offset: number): vscode.Position {
    const lines = this.content.split("\n");
    let currentOffset = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentOffset + lines[i].length >= offset) {
        return new vscode.Position(i, offset - currentOffset);
      }
      currentOffset += lines[i].length + 1;
    }
    return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
  }

  getWordRangeAtPosition(position: vscode.Position, regex?: RegExp): vscode.Range | undefined {
    return undefined;
  }

  validateRange(range: vscode.Range): vscode.Range {
    return range;
  }

  validatePosition(position: vscode.Position): vscode.Position {
    return position;
  }
}

function generateTestFile(lines: number, includeJSX: boolean = true, includeEmotion: boolean = true): string {
  let code = "";
  
  if (includeEmotion) {
    code += "import styled from '@emotion/styled';\n\n";
  } else {
    code += "import React from 'react';\n\n";
  }

  if (includeEmotion) {
    // Add some styled components
    for (let i = 0; i < Math.min(5, Math.floor(lines / 100)); i++) {
      code += `const Component${i} = styled.div\`
  padding: 10px;
  margin: 5px;
  color: red;
\`;\n\n`;
    }
  }

  if (includeJSX) {
    code += "const App = () => {\n  return (\n    <div>\n";
    
    const remainingLines = lines - code.split("\n").length - 10;
    for (let i = 0; i < Math.min(remainingLines, 50); i++) {
      if (includeEmotion && i < 5) {
        code += `      <Component${i % 5}>Content ${i}</Component${i % 5}>\n`;
      } else {
        code += `      <div>Regular content ${i}</div>\n`;
      }
    }
    
    code += "    </div>\n  );\n};\n";
  } else {
    // Non-JSX code
    for (let i = 0; i < lines - code.split("\n").length; i++) {
      code += `// Non-JSX line ${i}\nconst value${i} = "test";\n`;
    }
  }

  // Fill remaining lines with comments
  const currentLines = code.split("\n").length;
  for (let i = currentLines; i < lines; i++) {
    code += `// Filler line ${i}\n`;
  }

  return code;
}

describe("Performance Optimizations", () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  describe("Early Exit Optimizations", () => {
    it("should exit very quickly for files without JSX elements", async () => {
      const noJSXFile = generateTestFile(1000, false, false);
      const document = new MockTextDocument(noJSXFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(`No JSX file (1000 lines) analysis time: ${analysisTime.toFixed(2)}ms`);

      expect(analysisTime).toBeLessThan(5); // Should be very fast
      expect(result.styledComponents.size).toBe(0);
      expect(result.tokens.length).toBe(0);
    });

    it("should handle files with JSX but no emotion imports efficiently", async () => {
      const jsxNoEmotionFile = generateTestFile(1000, true, false);
      const document = new MockTextDocument(jsxNoEmotionFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(`JSX no emotion file (1000 lines) analysis time: ${analysisTime.toFixed(2)}ms`);

      expect(analysisTime).toBeLessThan(20); // Should be reasonably fast
      expect(result.styledComponents.size).toBe(0); 
      expect(result.tokens.length).toBe(0);
      expect(result.importInfo.hasEmotionImport).toBe(false);
    });
  });

  describe("Single-Pass Analysis", () => {
    it("should efficiently analyze files with emotion styled components", async () => {
      const emotionFile = generateTestFile(1000, true, true);
      const document = new MockTextDocument(emotionFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(`Emotion file (1000 lines) single-pass analysis time: ${analysisTime.toFixed(2)}ms`);

      expect(analysisTime).toBeLessThan(50); // Should be efficient
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.importInfo.hasEmotionImport).toBe(true);
    });
  });

  describe("Streaming Analysis for Large Files", () => {
    it("should use streaming analysis for very large files", async () => {
      const largeFile = generateTestFile(8000, true, true); // Above 5000 line threshold
      const document = new MockTextDocument(largeFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(`Large file (8000 lines) streaming analysis time: ${analysisTime.toFixed(2)}ms`);

      expect(analysisTime).toBeLessThan(600); // Should be better than before
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it("should still use regular analysis for medium files", async () => {
      const mediumFile = generateTestFile(3000, true, true); // Below 5000 line threshold  
      const document = new MockTextDocument(mediumFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(`Medium file (3000 lines) regular analysis time: ${analysisTime.toFixed(2)}ms`);

      expect(analysisTime).toBeLessThan(150); // Should be efficient
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });
  });

  describe("Cache Performance", () => {
    it("should cache results effectively with optimizations", async () => {
      const testFile = generateTestFile(1000, true, true);
      const document = new MockTextDocument(testFile);

      // First analysis  
      const start1 = performance.now();
      const result1 = await analyzer.analyze(document);
      const end1 = performance.now();
      const firstTime = end1 - start1;

      // Second analysis (cached)
      const start2 = performance.now();
      const result2 = await analyzer.analyze(document);
      const end2 = performance.now();
      const secondTime = end2 - start2;

      console.log(`First optimized analysis: ${firstTime.toFixed(2)}ms`);
      console.log(`Second optimized analysis (cached): ${secondTime.toFixed(2)}ms`);

      expect(secondTime).toBeLessThan(2); // Cache should be very fast
      expect(result1).toBe(result2); // Should be same object reference
    });
  });

  describe("Correctness Verification", () => {
    it("should produce same results as before optimizations", async () => {
      const testFile = `
import styled from '@emotion/styled';

const Button = styled.button\`
  background: blue;
  color: white;
\`;

const Container = styled.div\`
  padding: 20px;
\`;

const App = () => {
  return (
    <Container>
      <Button>Click me</Button>
      <Button>Another button</Button>
    </Container>
  );
};
      `;

      const document = new MockTextDocument(testFile);
      const result = await analyzer.analyze(document);

      // Debug: print everything
      console.log("Test file:");
      console.log(testFile);
      console.log("\nStyled components found:", Array.from(result.styledComponents));  
      console.log("Import info:", result.importInfo);
      console.log("Number of tokens:", result.tokens.length);
      
      console.log("\nGenerated tokens:");
      result.tokens.forEach((token, index) => {
        const lines = testFile.split('\n');
        const lineText = lines[token.line] || 'LINE_NOT_FOUND';
        const tokenText = lineText.substring(token.character, token.character + token.length);
        console.log(`  ${index + 1}. Line ${token.line}, Char ${token.character}, Length ${token.length}, Text: "${tokenText}"`);
        console.log(`     Full line: "${lineText}"`);
      });

      // Verify results are correct
      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.styledComponents.has("Container")).toBe(true);
      expect(result.importInfo.hasEmotionImport).toBe(true);
      
      expect(result.tokens.length).toBe(6); // 2 Container (open+close) + 4 Button (2 open + 2 close)
      
      // Verify token positions are reasonable
      result.tokens.forEach(token => {
        expect(token.line).toBeGreaterThanOrEqual(0);
        expect(token.character).toBeGreaterThanOrEqual(0);
        expect(token.length).toBeGreaterThan(0);
        expect(token.tokenType).toBe("emotionStyledComponent");
      });
    });
  });
}); 