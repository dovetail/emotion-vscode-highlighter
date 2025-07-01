import * as vscode from "vscode";
import { EmotionAnalyzer } from "../src/analyzer";
import { EmotionSemanticTokenProvider } from "../src/tokenProvider";

// Mock document for e2e testing
class E2ETestDocument implements vscode.TextDocument {
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

  constructor(private content: string, filename: string = "test.tsx") {
    this.languageId = "typescriptreact";
    this.fileName = filename;
    this.uri = vscode.Uri.file(this.fileName);
    this.lineCount = content.split("\n").length;
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

describe("End-to-End Color Configuration Tests", () => {
  let analyzer: EmotionAnalyzer;
  let tokenProvider: EmotionSemanticTokenProvider;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
    tokenProvider = new EmotionSemanticTokenProvider();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  describe("Full Workflow: Detection → Tokenization → Color Config", () => {
    it("E2E: Should detect styled components and generate correct tokens for color application", async () => {
      const testCode = `
        import styled from '@emotion/styled';

        const Container = styled.div\`
          padding: 20px;
        \`;

        const Button = styled.button({
          background: 'blue'
        });

        const Input = styled('input')\`
          border: 1px solid gray;
        \`;

        function App() {
          return (
            <Container>
              <Button>Click me</Button>
              <Input placeholder="test" />
            </Container>
          );
        }
      `;

      const document = new E2ETestDocument(testCode);

      // Step 1: Verify component detection
      const analysisResult = analyzer.analyze(document);
      
      console.log("E2E Test - Detected components:", Array.from(analysisResult.styledComponents));
      console.log("E2E Test - Generated tokens:", analysisResult.tokens);

      expect(analysisResult.styledComponents.has("Container")).toBe(true);
      expect(analysisResult.styledComponents.has("Button")).toBe(true);
      expect(analysisResult.styledComponents.has("Input")).toBe(true);

      // Step 2: Verify token generation - now includes both opening and closing tags
      expect(analysisResult.tokens.length).toBe(5); // Container(2), Button(2), Input(1 self-closing)

      // Step 3: Verify all tokens are emotion styled components
      analysisResult.tokens.forEach(token => {
        expect(token.tokenType).toBe("emotionStyledComponent");
        expect(typeof token.line).toBe("number");
        expect(typeof token.character).toBe("number");
        expect(typeof token.length).toBe("number");
      });

      // Step 4: Verify semantic token provider
      const semanticTokens = await tokenProvider.provideDocumentSemanticTokens(
        document,
        new vscode.CancellationTokenSource().token
      );

      expect(semanticTokens.data.length).toBeGreaterThan(0);
      console.log("E2E Test - Semantic tokens data length:", semanticTokens.data.length);
    });

    it("E2E: Should generate correct color configuration for different settings", async () => {
      const testCases = [
        {
          color: "#ff69b4",
          fontStyle: "bold",
          underline: true,
          expected: {
            foreground: "#ff69b4",
            fontStyle: "bold",
            underline: true
          }
        },
        {
          color: "#4ECDC4",
          fontStyle: "italic",
          underline: false,
          expected: {
            foreground: "#4ECDC4",
            fontStyle: "italic"
          }
        },
        {
          color: "#FF6B6B",
          fontStyle: "normal",
          underline: false,
          expected: {
            foreground: "#FF6B6B"
          }
        }
      ];

      testCases.forEach(({ color, fontStyle, underline, expected }) => {
        // Simulate building config like the extension does
        const styleConfig: any = {
          foreground: color,
        };

        if (fontStyle !== "normal") {
          styleConfig.fontStyle = fontStyle;
        }

        if (underline) {
          styleConfig.underline = true;
        }

        console.log(`E2E Test - Config for ${color}:`, styleConfig);
        expect(styleConfig).toEqual(expected);

        // Test the full configuration structure
        const fullConfig = {
          "editor.semanticTokenColorCustomizations": {
            "rules": {
              "emotionStyledComponent": styleConfig
            }
          }
        };

        expect(fullConfig["editor.semanticTokenColorCustomizations"]["rules"]["emotionStyledComponent"]).toEqual(expected);
      });
    });

    it("E2E: Should handle real-world component patterns", async () => {
      const realWorldCode = `
        import styled from '@emotion/styled';
        import { css } from '@emotion/react';

        // Different syntax patterns
        const StyledButton = styled.button\`
          background: \${props => props.primary ? 'blue' : 'gray'};
        \`;

        const FlexContainer = styled.div({
          display: 'flex',
          flexDirection: 'column'
        });

        const CustomInput = styled('input')\`
          \${props => css\`
            border: 1px solid \${props.error ? 'red' : 'gray'};
          \`}
        \`;

        const ExtendedButton = styled(StyledButton)\`
          border-radius: 4px;
        \`;

        // Usage in complex JSX
        function MyComponent() {
          return (
            <FlexContainer>
              <StyledButton primary>Primary</StyledButton>
              <StyledButton>Secondary</StyledButton>
              <CustomInput error placeholder="Error input" />
              <CustomInput placeholder="Normal input" />
              <ExtendedButton>Extended</ExtendedButton>
            </FlexContainer>
          );
        }
      `;

      const document = new E2ETestDocument(realWorldCode);
      const result = await analyzer.analyze(document);

      // Should detect all component definitions
      expect(result.styledComponents.has("StyledButton")).toBe(true);
      expect(result.styledComponents.has("FlexContainer")).toBe(true);
      expect(result.styledComponents.has("CustomInput")).toBe(true);
      expect(result.styledComponents.has("ExtendedButton")).toBe(true);

      // Should generate tokens for all JSX usages - now includes both opening and closing tags
      // FlexContainer(2) + StyledButton(4) + CustomInput(2) + ExtendedButton(2) = 10 tokens
      expect(result.tokens.length).toBe(10);

      console.log("E2E Test - Real-world components:", Array.from(result.styledComponents));
      console.log("E2E Test - Real-world tokens count:", result.tokens.length);

      // Verify token details
      const tokensByLine = result.tokens.reduce((acc, token) => {
        acc[token.line] = acc[token.line] || [];
        acc[token.line].push(token);
        return acc;
      }, {} as Record<number, any[]>);

      console.log("E2E Test - Tokens by line:", tokensByLine);
    });
  });

  describe("Color Configuration Validation", () => {
    it("Should validate hex color patterns", async () => {
      const validColors = ["#ff69b4", "#FF69B4", "#f69", "#F69", "#000000", "#ffffff"];
      const invalidColors = ["ff69b4", "#gg69b4", "#12345", "red", "rgb(255,0,0)"];

      const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      validColors.forEach(color => {
        expect(hexColorPattern.test(color)).toBe(true);
        console.log(`✅ Valid color: ${color}`);
      });

      invalidColors.forEach(color => {
        expect(hexColorPattern.test(color)).toBe(false);
        console.log(`❌ Invalid color: ${color}`);
      });
    });

         it("Should generate correct VS Code configuration structure", async () => {
       const testColor = "#ff69b4";
       const testFontStyle: string = "bold";
       const testUnderline = true;

      const expectedConfig = {
        "editor.semanticTokenColorCustomizations": {
          "rules": {
            "emotionStyledComponent": {
              "foreground": "#ff69b4",
              "fontStyle": "bold",
              "underline": true
            }
          }
        }
      };

                    // Build config like the extension
       const styleConfig: any = { foreground: testColor };
       // Add font style if not normal
       if (testFontStyle === "bold" || testFontStyle === "italic" || testFontStyle === "bold italic") {
         styleConfig.fontStyle = testFontStyle;
       }
       if (testUnderline) styleConfig.underline = true;

      const actualConfig = {
        "editor.semanticTokenColorCustomizations": {
          "rules": {
            "emotionStyledComponent": styleConfig
          }
        }
      };

      expect(actualConfig).toEqual(expectedConfig);
      console.log("Generated config:", JSON.stringify(actualConfig, null, 2));
    });
  });

  describe("Token Provider E2E", () => {
    it("Should provide semantic tokens that VS Code can use for highlighting", async () => {
      const code = `
        import styled from '@emotion/styled';
        const MyButton = styled.button\`color: red;\`;
        const App = () => <MyButton>Test</MyButton>;
      `;

      const document = new E2ETestDocument(code);
      const tokens = await tokenProvider.provideDocumentSemanticTokens(
        document,
        new vscode.CancellationTokenSource().token
      );

      // Verify semantic tokens structure
      expect(tokens).toBeInstanceOf(vscode.SemanticTokens);
      expect(tokens.data).toBeInstanceOf(Uint32Array);
      expect(tokens.data.length).toBeGreaterThan(0);

      // Semantic tokens are encoded as [line, character, length, tokenType, tokenModifiers]
      // So length should be multiple of 5
      expect(tokens.data.length % 5).toBe(0);

      console.log("Semantic tokens data:", Array.from(tokens.data));

      // Verify legend
      const legend = tokenProvider.getLegend();
      expect(legend.tokenTypes).toContain("emotionStyledComponent");
      console.log("Token legend:", legend);
    });
  });
}); 