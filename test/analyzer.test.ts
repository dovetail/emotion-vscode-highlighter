import * as vscode from "vscode";
import { EmotionAnalyzer } from "../src/analyzer";

// Mock vscode.TextDocument for testing
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

  constructor(private content: string, language: string = "typescriptreact") {
    this.languageId = language;
    this.version = 1;
    this.fileName = `test.${language === "typescriptreact" ? "tsx" : language === "typescript" ? "ts" : "js"}`;
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
      offset += lines[i].length + 1; // +1 for newline
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
      currentOffset += lines[i].length + 1; // +1 for newline
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

describe("EmotionAnalyzer", () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  describe("Basic styled component detection", () => {
    it("should detect basic emotion styled components", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Button = styled.div\`
          color: red;
        \`;
        
        const Input = styled.input\`
          border: 1px solid blue;
        \`;
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.styledComponents.has("Input")).toBe(true);
      expect(result.importInfo.hasEmotionImport).toBe(true);
      expect(result.importInfo.styledIdentifier).toBe("styled");
    });

    it("should detect styled-components imports", async () => {
      const code = `
        import styled from 'styled-components';
        
        const Container = styled.div\`
          padding: 20px;
        \`;
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("Container")).toBe(true);
      expect(result.importInfo.hasStyledComponentsImport).toBe(true);
    });

    it("should detect styled components with function call syntax", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const CustomButton = styled('button')\`
          background: blue;
        \`;
        
        const StyledDiv = styled('div')({
          color: 'red'
        });
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("CustomButton")).toBe(true);
      expect(result.styledComponents.has("StyledDiv")).toBe(true);
    });

    it("should detect component extensions", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const BaseButton = styled.button\`
          padding: 10px;
        \`;
        
        const RedButton = styled(BaseButton)\`
          color: red;
        \`;
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("BaseButton")).toBe(true);
      expect(result.styledComponents.has("RedButton")).toBe(true);
    });
  });

  describe("Import handling", () => {
    it("should handle aliased imports", async () => {
      const code = `
        import styledComponent from '@emotion/styled';
        
        const Button = styledComponent.div\`
          color: blue;
        \`;
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.importInfo.styledIdentifier).toBe("styledComponent");
    });

    it("should handle named imports", async () => {
      const code = `
        import { styled } from '@emotion/styled';
        
        const Header = styled.h1\`
          font-size: 24px;
        \`;
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("Header")).toBe(true);
    });
  });

  describe("JSX usage detection", () => {
    it("should find styled component usage in JSX", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Button = styled.button\`
          background: blue;
        \`;
        
        const App = () => {
          return (
            <div>
              <Button>Click me</Button>
              <Button disabled>Disabled</Button>
            </div>
          );
        };
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.tokens.length).toBe(4); // Two Button usages: 2 opening + 2 closing tags
      expect(
        result.tokens.every(
          (token) => token.tokenType === "emotionStyledComponent"
        )
      ).toBe(true);
    });

    it("should handle self-closing JSX elements", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Input = styled.input\`
          border: 1px solid gray;
        \`;
        
        const Form = () => {
          return <Input placeholder="Enter text" />;
        };
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("Input")).toBe(true);
      expect(result.tokens.length).toBe(1);
    });
  });

  describe("Performance and edge cases", () => {
    it("should return empty result for files without emotion imports", async () => {
      const code = `
        import React from 'react';
        
        const Button = () => <button>Click me</button>;
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.size).toBe(0);
      expect(result.tokens.length).toBe(0);
      expect(result.importInfo.hasEmotionImport).toBe(false);
    });

    it("should handle empty files", async () => {
      const document = new MockTextDocument("");
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.size).toBe(0);
      expect(result.tokens.length).toBe(0);
    });

    it("should handle syntax errors gracefully", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Button = styled.div\`
          color: red
        // Missing closing backtick
      `;

      const document = new MockTextDocument(code);

      // Should not throw an error
      expect(() => analyzer.analyze(document)).not.toThrow();
    });

    it("should use cache for repeated analysis", async () => {
      const code = `
        import styled from '@emotion/styled';
        const Button = styled.div\`color: red;\`;
      `;

      const document = new MockTextDocument(code);

      // First analysis
      const result1 = analyzer.analyze(document);
      expect(analyzer.getCacheSize()).toBe(1);

      // Second analysis should use cache
      const result2 = analyzer.analyze(document);
      expect(result1).toBe(result2); // Should be the same object reference
    });
  });

  describe("Complex scenarios", () => {
    it("should handle multiple imports and complex component definitions", async () => {
      const code = `
        import styled from '@emotion/styled';
        import { css } from '@emotion/react';
        
        const theme = {
          primary: 'blue',
          secondary: 'red'
        };
        
        const Button = styled.button\`
          background: \${props => props.primary ? theme.primary : theme.secondary};
          padding: 10px;
        \`;
        
        const Container = styled.div(props => ({
          display: 'flex',
          flexDirection: props.vertical ? 'column' : 'row'
        }));
        
        const ExtendedButton = styled(Button)\`
          border-radius: 4px;
        \`;
        
        const Component = () => {
          return (
            <Container vertical>
              <Button primary>Primary</Button>
              <ExtendedButton>Extended</ExtendedButton>
            </Container>
          );
        };
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.styledComponents.has("Container")).toBe(true);
      expect(result.styledComponents.has("ExtendedButton")).toBe(true);
      expect(result.tokens.length).toBe(6); // Container, Button, ExtendedButton usage: 3 opening + 3 closing tags
    });
  });

  describe("Focused Input/Output Tests - Object Style Components", () => {
    it("should detect object-style styled components: styled.div({...})", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const StyledDiv = styled.div({
          color: 'red',
          padding: '10px'
        });
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: StyledDiv should be detected
      expect(result.styledComponents.has("StyledDiv")).toBe(true);
      expect(result.importInfo.hasEmotionImport).toBe(true);
      expect(result.importInfo.styledIdentifier).toBe("styled");
    });

    it("should detect function call syntax: styled('div')({...})", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const CustomDiv = styled('div')({
          backgroundColor: 'blue'
        });
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: CustomDiv should be detected
      expect(result.styledComponents.has("CustomDiv")).toBe(true);
    });

    it("should detect multiple object-style components in one file", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Button = styled.button({
          border: 'none',
          padding: '8px 16px'
        });
        
        const Input = styled.input({
          border: '1px solid #ccc'
        });
        
        const Container = styled.div({
          display: 'flex'
        });
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: All three components should be detected
      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.styledComponents.has("Input")).toBe(true);
      expect(result.styledComponents.has("Container")).toBe(true);
      expect(result.styledComponents.size).toBe(3);
    });
  });

  describe("Focused Input/Output Tests - JSX Tokenization", () => {
    it("should generate exactly one token for one JSX element usage", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Button = styled.button\`
          color: red;
        \`;
        
        function App() {
          return <Button>Click me</Button>;
        }
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: One styled component detected, two tokens generated (opening + closing)
      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.tokens.length).toBe(2);
      
      // Verify token properties - both should be for "Button"
      result.tokens.forEach(token => {
        expect(token.tokenType).toBe("emotionStyledComponent");
        expect(token.length).toBe(6); // "Button".length
        expect(typeof token.line).toBe("number");
        expect(typeof token.character).toBe("number");
      });
    });

    it("should generate exactly two tokens for two JSX element usages", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Button = styled.button\`color: red;\`;
        
        function App() {
          return (
            <div>
              <Button>First</Button>
              <Button>Second</Button>
            </div>
          );
        }
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: One styled component, four usage tokens (2 opening + 2 closing)
      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.tokens.length).toBe(4);
      
      // Both tokens should be for the same component type
      result.tokens.forEach(token => {
        expect(token.tokenType).toBe("emotionStyledComponent");
        expect(token.length).toBe(6); // "Button".length
      });
    });

    it("should handle self-closing JSX elements", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        const Input = styled.input\`
          border: 1px solid gray;
        \`;
        
        function Form() {
          return <Input placeholder="Enter text" />;
        }
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: One component, one self-closing token
      expect(result.styledComponents.has("Input")).toBe(true);
      expect(result.tokens.length).toBe(1);
      expect(result.tokens[0].tokenType).toBe("emotionStyledComponent");
      expect(result.tokens[0].length).toBe(5); // "Input".length
    });

    it("should distinguish styled components from regular JSX", async () => {
      const code = `
        import styled from '@emotion/styled';
        import React from 'react';
        
        const StyledButton = styled.button\`color: red;\`;
        
        function App() {
          return (
            <div>
              <button>Regular Button</button>
              <StyledButton>Styled Button</StyledButton>
              <span>Regular Span</span>
            </div>
          );
        }
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: Only StyledButton should generate tokens (opening + closing)
      expect(result.styledComponents.has("StyledButton")).toBe(true);
      expect(result.tokens.length).toBe(2);
      result.tokens.forEach(token => {
        expect(token.tokenType).toBe("emotionStyledComponent");
        expect(token.length).toBe(12); // "StyledButton".length
      });
    });
  });

  describe("Focused Input/Output Tests - Mixed Syntax", () => {
    it("should handle template literals, function calls, and object syntax together", async () => {
      const code = `
        import styled from '@emotion/styled';
        
        // Template literal syntax
        const TemplateButton = styled.button\`
          color: red;
        \`;
        
        // Function call syntax  
        const FunctionButton = styled('button')\`
          color: blue;
        \`;
        
        // Object syntax
        const ObjectButton = styled.button({
          color: 'green'
        });
        
        function App() {
          return (
            <div>
              <TemplateButton>Template</TemplateButton>
              <FunctionButton>Function</FunctionButton>
              <ObjectButton>Object</ObjectButton>
            </div>
          );
        }
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: All three components detected, three tokens generated
      expect(result.styledComponents.has("TemplateButton")).toBe(true);
      expect(result.styledComponents.has("FunctionButton")).toBe(true);
      expect(result.styledComponents.has("ObjectButton")).toBe(true);
      expect(result.styledComponents.size).toBe(3);
      expect(result.tokens.length).toBe(6); // 3 components × 2 tags each (opening + closing)
      
      // All tokens should be emotion styled components
      result.tokens.forEach(token => {
        expect(token.tokenType).toBe("emotionStyledComponent");
      });
    });
  });

  describe("Focused Input/Output Tests - Import Variations", () => {
    it("should handle aliased imports correctly", async () => {
      const code = `
        import myStyled from '@emotion/styled';
        
        const Button = myStyled.div\`
          color: red;
        \`;
        
        function App() {
          return <Button>Click me</Button>;
        }
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: Should work with aliased import
      expect(result.importInfo.styledIdentifier).toBe("myStyled");
      expect(result.styledComponents.has("Button")).toBe(true);
      expect(result.tokens.length).toBe(2); // opening + closing tags
    });

    it("should handle styled-components library", async () => {
      const code = `
        import styled from 'styled-components';
        
        const Title = styled.h1\`
          font-size: 24px;
        \`;
        
        function Header() {
          return <Title>My Title</Title>;
        }
      `;

      const document = new MockTextDocument(code);
      const result = await analyzer.analyze(document);

      // Expected output: Should work with styled-components
      expect(result.importInfo.hasStyledComponentsImport).toBe(true);
      expect(result.styledComponents.has("Title")).toBe(true);
      expect(result.tokens.length).toBe(2); // opening + closing tags
    });
  });
});

describe("Closing Tag Support Tests", () => {
  let analyzer: EmotionAnalyzer;

  beforeEach(() => {
    analyzer = new EmotionAnalyzer();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  it("should highlight both opening and closing tags", async () => {
    const code = `
      import styled from '@emotion/styled';
      
      const Button = styled.button\`
        color: red;
      \`;
      
      function App() {
        return <Button>Click me</Button>;
      }
    `;

    const document = new MockTextDocument(code);
    const result = await analyzer.analyze(document);

    // Should detect the styled component
    expect(result.styledComponents.has("Button")).toBe(true);
    
    // Should generate tokens for both opening AND closing tags
    expect(result.tokens.length).toBe(2); // <Button> and </Button>
    
    // Both tokens should be for emotion styled components
    result.tokens.forEach(token => {
      expect(token.tokenType).toBe("emotionStyledComponent");
      expect(token.length).toBe(6); // "Button".length
    });

    // Verify we have tokens on different positions (opening vs closing)
    const tokenPositions = result.tokens.map(token => ({ line: token.line, character: token.character }));
    expect(tokenPositions.length).toBe(2);
    expect(tokenPositions[0]).not.toEqual(tokenPositions[1]); // Different positions
  });

  it("should highlight multiple components with opening and closing tags", async () => {
    const code = `
      import styled from '@emotion/styled';
      
      const Container = styled.div\`padding: 20px;\`;
      const Title = styled.h1\`font-size: 24px;\`;
      
      function App() {
        return (
          <Container>
            <Title>Hello World</Title>
          </Container>
        );
      }
    `;

    const document = new MockTextDocument(code);
    const result = await analyzer.analyze(document);

    // Should detect both styled components
    expect(result.styledComponents.has("Container")).toBe(true);
    expect(result.styledComponents.has("Title")).toBe(true);
    
    // Should generate 4 tokens: <Container>, <Title>, </Title>, </Container>
    expect(result.tokens.length).toBe(4);
    
    // All tokens should be emotion styled components
    result.tokens.forEach(token => {
      expect(token.tokenType).toBe("emotionStyledComponent");
    });
  });

  it("should handle self-closing tags correctly (no closing tag needed)", async () => {
    const code = `
      import styled from '@emotion/styled';
      
      const Input = styled.input\`
        border: 1px solid gray;
      \`;
      
      function App() {
        return <Input placeholder="Enter text" />;
      }
    `;

    const document = new MockTextDocument(code);
    const result = await analyzer.analyze(document);

    // Should detect the styled component
    expect(result.styledComponents.has("Input")).toBe(true);
    
    // Should generate only 1 token for self-closing tag
    expect(result.tokens.length).toBe(1);
    expect(result.tokens[0].tokenType).toBe("emotionStyledComponent");
    expect(result.tokens[0].length).toBe(5); // "Input".length
  });
});
