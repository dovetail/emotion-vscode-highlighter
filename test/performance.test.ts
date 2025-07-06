import * as vscode from "vscode";
import { EmotionAnalyzer } from "../src/analyzer";

// Mock TextDocument for performance testing
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
    this.uri = vscode.Uri.file(`/test/mock-${Math.random()}.tsx`);
    this.fileName = this.uri.fsPath;
    this.languageId = language;
    this.version = 1;
    this.isDirty = false;
    this.isClosed = false;
    this.isUntitled = false;
    this.eol = vscode.EndOfLine.LF;
    this.lineCount = content.split("\n").length;
    this.encoding = "utf8";
  }

  getText(): string {
    return this.content;
  }

  save(): Thenable<boolean> {
    return Promise.resolve(true);
  }

  lineAt(line: number | vscode.Position): vscode.TextLine {
    const lineNumber = typeof line === "number" ? line : line.line;
    const lines = this.content.split("\n");
    const lineText = lines[lineNumber] || "";
    
    return {
      lineNumber,
      text: lineText,
      range: new vscode.Range(lineNumber, 0, lineNumber, lineText.length),
      rangeIncludingLineBreak: new vscode.Range(
        lineNumber,
        0,
        lineNumber + 1,
        0
      ),
      firstNonWhitespaceCharacterIndex: lineText.search(/\S/),
      isEmptyOrWhitespace: lineText.trim().length === 0,
    };
  }

  offsetAt(position: vscode.Position): number {
    const lines = this.content.split("\n");
    let offset = 0;
    for (let i = 0; i < position.line; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    return offset + position.character;
  }

  positionAt(offset: number): vscode.Position {
    const lines = this.content.split("\n");
    let currentOffset = 0;
    for (let line = 0; line < lines.length; line++) {
      const lineLength = lines[line].length;
      if (currentOffset + lineLength >= offset) {
        return new vscode.Position(line, offset - currentOffset);
      }
      currentOffset += lineLength + 1; // +1 for newline
    }
    return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
  }

  getWordRangeAtPosition(): vscode.Range | undefined {
    return undefined;
  }

  validateRange(range: vscode.Range): vscode.Range {
    return range;
  }

  validatePosition(position: vscode.Position): vscode.Position {
    return position;
  }
}

function generateLargeTestFile(lines: number): string {
  let code = `import styled from '@emotion/styled';

const Container = styled.div\`
  display: flex;
  flex-direction: column;
  padding: 20px;
\`;

const Button = styled.button\`
  background: blue;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
\`;

const Card = styled.div\`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
\`;

const Text = styled.span\`
  font-size: 14px;
  color: #333;
\`;

const Input = styled.input\`
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
\`;

const Header = styled.h1\`
  font-size: 24px;
  margin: 0 0 16px 0;
\`;

export const App = () => (
  <Container>
    <Header>Large Test File</Header>
    <Card>
      <Text>This is a test component</Text>
      <Button>Click me</Button>
      <Input placeholder="Enter text" />
    </Card>
`;

  // Generate many lines of JSX to simulate a large file
  for (let i = 0; i < lines - 50; i++) {
    const componentType = ["Card", "Button", "Text", "Input", "Container"][
      i % 5
    ];
    code += `    <${componentType}>Line ${i}</${componentType}>\n`;
  }

  code += `  </Container>
);
`;

  return code;
}

function generateFileWithoutEmotion(lines: number): string {
  let code = `import React from 'react';

const RegularComponent = () => {
  return (
    <div>
      <h1>Regular HTML Component</h1>
      <p>This file has no emotion styled components</p>
`;

  // Generate many lines without styled components
  for (let i = 0; i < lines - 10; i++) {
    code += `      <div>Regular HTML element ${i}</div>\n`;
  }

  code += `    </div>
  );
};

export default RegularComponent;
`;

  return code;
}

describe("Performance Tests", () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  describe("Large file performance", () => {
    it("should process medium files quickly (1000 lines)", async () => {
      const code = generateLargeTestFile(1000);
      const document = new MockTextDocument(code);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `Medium file (1000 lines) analysis time: ${analysisTime.toFixed(2)}ms`
      );

      expect(analysisTime).toBeLessThan(200); // More realistic expectation
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it("should process large files reasonably quickly (5000 lines)", async () => {
      const code = generateLargeTestFile(5000);
      const document = new MockTextDocument(code);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `Large file (5000 lines) analysis time: ${analysisTime.toFixed(2)}ms`
      );

      expect(analysisTime).toBeLessThan(800); // More realistic expectation
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it("should process very large files within acceptable limits (10000 lines)", async () => {
      const code = generateLargeTestFile(10000);
      const document = new MockTextDocument(code);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `Very large file (10000 lines) analysis time: ${analysisTime.toFixed(
          2
        )}ms`
      );

      expect(analysisTime).toBeLessThan(2000); // More realistic expectation
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });
  });

  describe("Early exit performance", () => {
    it("should exit very quickly for files without emotion imports", async () => {
      const regularFile = generateFileWithoutEmotion(5000);
      const document = new MockTextDocument(regularFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `File without emotion (5000 lines) analysis time: ${analysisTime.toFixed(
          2
        )}ms`
      );

      expect(analysisTime).toBeLessThan(300); // More realistic for files without JSX early exit
      expect(result.styledComponents.size).toBe(0);
      expect(result.tokens.length).toBe(0);
      expect(result.importInfo.hasEmotionImport).toBe(false);
    });

    it("should exit quickly for empty files", async () => {
      const document = new MockTextDocument("");

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(`Empty file analysis time: ${analysisTime.toFixed(2)}ms`);

      expect(analysisTime).toBeLessThan(10); // Should be under 10ms
      expect(result.styledComponents.size).toBe(0);
      expect(result.tokens.length).toBe(0);
    });

    it("should exit quickly for files with emotion imports but no styled components", async () => {
      const code = `
        import styled from '@emotion/styled';
        import { css } from '@emotion/react';
        
        // File with emotion imports but no styled components or JSX
        const regularFunction = () => {
          return 'hello world';
        };
        
        ${"// ".repeat(1000).split(" ").join("\n// ")} // Many comment lines
      `;

      const document = new MockTextDocument(code);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `File with emotion imports but no components analysis time: ${analysisTime.toFixed(
          2
        )}ms`
      );

      expect(analysisTime).toBeLessThan(50); // Should be reasonably fast since no JSX
      expect(result.styledComponents.size).toBe(0);
      expect(result.tokens.length).toBe(0);
      expect(result.importInfo.hasEmotionImport).toBe(true);
    });
  });

  describe("Cache performance", () => {
    it("should use cache effectively for repeated analysis", async () => {
      const code = generateLargeTestFile(2000);
      const document = new MockTextDocument(code);

      // First analysis (cold)
      const start1 = performance.now();
      const result1 = await analyzer.analyze(document);
      const end1 = performance.now();
      const firstAnalysisTime = end1 - start1;

      // Second analysis (should use cache)
      const start2 = performance.now();
      const result2 = await analyzer.analyze(document);
      const end2 = performance.now();
      const secondAnalysisTime = end2 - start2;

      console.log(`First analysis time: ${firstAnalysisTime.toFixed(2)}ms`);
      console.log(
        `Second analysis time (cached): ${secondAnalysisTime.toFixed(2)}ms`
      );

      expect(secondAnalysisTime).toBeLessThan(20); // Cached should be much faster
      expect(result1).toBe(result2); // Should return the same object reference
      expect(analyzer.getCacheSize()).toBe(1);
    });

    it("should handle multiple files in cache efficiently", async () => {
      const files = [];
      for (let i = 0; i < 10; i++) {
        const code = `
          import styled from '@emotion/styled';
          const Component${i} = styled.div\`color: red;\`;
          const App${i} = () => <Component${i}>Test</Component${i}>;
        `;
        files.push(new MockTextDocument(code, "typescript"));
      }

      // Analyze all files
      const start = performance.now();
      for (const file of files) {
        await analyzer.analyze(file);
      }
      const end = performance.now();

      const totalTime = end - start;
      console.log(
        `Multiple files (10) analysis time: ${totalTime.toFixed(2)}ms`
      );
      console.log(
        `Average per file: ${(totalTime / files.length).toFixed(2)}ms`
      );

      expect(totalTime).toBeLessThan(200); // More realistic expectation
      expect(analyzer.getCacheSize()).toBe(10);

      // Re-analyze should be very fast (all cached)
      const start2 = performance.now();
      for (const file of files) {
        await analyzer.analyze(file);
      }
      const end2 = performance.now();

      const cachedTime = end2 - start2;
      console.log(
        `Multiple files (10) cached analysis time: ${cachedTime.toFixed(2)}ms`
      );

      expect(cachedTime).toBeLessThan(50); // All cached should be faster
    });
  });

  describe("Memory usage", () => {
    it("should not leak memory with repeated analysis", async () => {
      const code = generateLargeTestFile(1000);

      // Perform many analyses with different document versions
      for (let i = 0; i < 50; i++) {
        const document = new MockTextDocument(code);
        document.version = i; // Different version to avoid cache
        await analyzer.analyze(document);
      }

      // Cache should not grow indefinitely
      expect(analyzer.getCacheSize()).toBeLessThan(50);
    });
  });

  describe("Stress tests", () => {
    it("should handle files with many styled components", async () => {
      let code = "import styled from '@emotion/styled';\n\n";

      // Generate 100 styled components
      for (let i = 0; i < 100; i++) {
        code += `const Component${i} = styled.div\`color: hsl(${
          i * 3.6
        }, 50%, 50%);\`;\n`;
      }

      code += "\nconst App = () => (\n  <div>\n";
      for (let i = 0; i < 100; i++) {
        code += `    <Component${i}>Item ${i}</Component${i}>\n`;
      }
      code += "  </div>\n);\n";

      const document = new MockTextDocument(code);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `Many components (100) analysis time: ${analysisTime.toFixed(2)}ms`
      );

      expect(analysisTime).toBeLessThan(400); // More realistic expectation
      expect(result.styledComponents.size).toBe(100);
      expect(result.tokens.length).toBe(100); // One token per JSX usage
    });
  });
});
