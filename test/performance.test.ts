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
      rangeIncludingLineBreak: new vscode.Range(
        lineNumber,
        0,
        lineNumber + 1,
        0
      ),
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
    return new vscode.Position(
      lines.length - 1,
      lines[lines.length - 1].length
    );
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
  const components = [
    "Button",
    "Input",
    "Container",
    "Header",
    "Footer",
    "Sidebar",
    "Modal",
    "Card",
    "Form",
    "List",
  ];

  let code = "import styled from '@emotion/styled';\n\n";

  // Generate styled component definitions
  for (
    let i = 0;
    i < Math.min(components.length, Math.floor(lines / 20));
    i++
  ) {
    const component = components[i];
    code += `const ${component} = styled.div\`
  padding: 10px;
  margin: 5px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
\`;\n\n`;
  }

  // Generate a large component with many JSX usages
  code += "const App = () => {\n  return (\n    <div>\n";

  const remainingLines = lines - code.split("\n").length;
  const usagesPerComponent = Math.floor(
    remainingLines / (components.length * 3)
  );

  for (let i = 0; i < components.length && i < Math.floor(lines / 20); i++) {
    const component = components[i];
    for (let j = 0; j < usagesPerComponent; j++) {
      code += `      <${component} key="${i}-${j}">Content ${j}</${component}>\n`;
    }
  }

  code += "    </div>\n  );\n};\n";

  // Fill remaining lines with comments if needed
  const currentLines = code.split("\n").length;
  for (let i = currentLines; i < lines; i++) {
    code += `// Additional line ${i}\n`;
  }

  return code;
}

function generateFileWithoutEmotion(lines: number): string {
  let code = "import React from 'react';\n\n";

  code += "const regularComponents = {\n";
  for (let i = 0; i < Math.floor(lines / 10); i++) {
    code += `  Component${i}: () => <div>Regular component ${i}</div>,\n`;
  }
  code += "};\n\n";

  // Fill remaining lines
  const currentLines = code.split("\n").length;
  for (let i = currentLines; i < lines; i++) {
    code += `// Regular code line ${i}\n`;
  }

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
      const largeFile = generateLargeTestFile(1000);
      const document = new MockTextDocument(largeFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `Medium file (1000 lines) analysis time: ${analysisTime.toFixed(2)}ms`
      );

      expect(analysisTime).toBeLessThan(50); // Should be under 50ms
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it("should process large files reasonably quickly (5000 lines)", async () => {
      const largeFile = generateLargeTestFile(5000);
      const document = new MockTextDocument(largeFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `Large file (5000 lines) analysis time: ${analysisTime.toFixed(2)}ms`
      );

      expect(analysisTime).toBeLessThan(200); // Should be under 200ms
      expect(result.styledComponents.size).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it("should process very large files within acceptable limits (10000 lines)", async () => {
      const veryLargeFile = generateLargeTestFile(10000);
      const document = new MockTextDocument(veryLargeFile);

      const start = performance.now();
      const result = await analyzer.analyze(document);
      const end = performance.now();

      const analysisTime = end - start;
      console.log(
        `Very large file (10000 lines) analysis time: ${analysisTime.toFixed(
          2
        )}ms`
      );

      expect(analysisTime).toBeLessThan(500); // Should be under 500ms
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

      expect(analysisTime).toBeLessThan(10); // Should be under 10ms (early exit)
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

      expect(analysisTime).toBeLessThan(5); // Should be under 5ms
      expect(result.styledComponents.size).toBe(0);
      expect(result.tokens.length).toBe(0);
    });

    it("should exit quickly for files with emotion imports but no styled components", async () => {
      const code = `
        import styled from '@emotion/styled';
        import { css } from '@emotion/react';
        
        // File with emotion imports but no styled components
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

      expect(analysisTime).toBeLessThan(30); // Should be under 30ms
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
      const result1 = analyzer.analyze(document);
      const end1 = performance.now();
      const firstAnalysisTime = end1 - start1;

      // Second analysis (should use cache)
      const start2 = performance.now();
      const result2 = analyzer.analyze(document);
      const end2 = performance.now();
      const secondAnalysisTime = end2 - start2;

      console.log(`First analysis time: ${firstAnalysisTime.toFixed(2)}ms`);
      console.log(
        `Second analysis time (cached): ${secondAnalysisTime.toFixed(2)}ms`
      );

      expect(secondAnalysisTime).toBeLessThan(5); // Cached should be very fast
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
        analyzer.analyze(file);
      }
      const end = performance.now();

      const totalTime = end - start;
      console.log(
        `Multiple files (10) analysis time: ${totalTime.toFixed(2)}ms`
      );
      console.log(
        `Average per file: ${(totalTime / files.length).toFixed(2)}ms`
      );

      expect(totalTime).toBeLessThan(100); // All 10 files under 100ms
      expect(analyzer.getCacheSize()).toBe(10);

      // Re-analyze should be very fast (all cached)
      const start2 = performance.now();
      for (const file of files) {
        analyzer.analyze(file);
      }
      const end2 = performance.now();

      const cachedTime = end2 - start2;
      console.log(
        `Multiple files (10) cached analysis time: ${cachedTime.toFixed(2)}ms`
      );

      expect(cachedTime).toBeLessThan(10); // All cached should be very fast
    });
  });

  describe("Memory usage", () => {
    it("should not leak memory with repeated analysis", async () => {
      const code = generateLargeTestFile(1000);

      // Perform many analyses with different document versions
      for (let i = 0; i < 50; i++) {
        const document = new MockTextDocument(code);
        document.version = i; // Different version to avoid cache
        analyzer.analyze(document);
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

      expect(analysisTime).toBeLessThan(100); // Should handle 100 components efficiently
      expect(result.styledComponents.size).toBe(100);
      expect(result.tokens.length).toBe(100); // One token per JSX usage
    });
  });
});
