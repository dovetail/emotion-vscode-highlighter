"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const analyzer_1 = require("../src/analyzer");
// Mock vscode.TextDocument for testing
class MockTextDocument {
    constructor(content, language = "typescript") {
        this.content = content;
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
    getText() {
        return this.content;
    }
    save() {
        return Promise.resolve(true);
    }
    lineAt(line) {
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
    offsetAt(position) {
        const lines = this.content.split("\n");
        let offset = 0;
        for (let i = 0; i < position.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        return offset + position.character;
    }
    positionAt(offset) {
        const lines = this.content.split("\n");
        let currentOffset = 0;
        for (let i = 0; i < lines.length; i++) {
            if (currentOffset + lines[i].length >= offset) {
                return new vscode.Position(i, offset - currentOffset);
            }
            currentOffset += lines[i].length + 1; // +1 for newline
        }
        return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
    }
    getWordRangeAtPosition() {
        return undefined;
    }
    validateRange(range) {
        return range;
    }
    validatePosition(position) {
        return position;
    }
}
describe("EmotionAnalyzer", () => {
    let analyzer;
    beforeEach(() => {
        analyzer = new analyzer_1.EmotionAnalyzer();
    });
    afterEach(() => {
        analyzer.clearCache();
    });
    describe("Basic styled component detection", () => {
        it("should detect basic emotion styled components", () => {
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
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("Button")).toBe(true);
            expect(result.styledComponents.has("Input")).toBe(true);
            expect(result.importInfo.hasEmotionImport).toBe(true);
            expect(result.importInfo.styledIdentifier).toBe("styled");
        });
        it("should detect styled-components imports", () => {
            const code = `
        import styled from 'styled-components';
        
        const Container = styled.div\`
          padding: 20px;
        \`;
      `;
            const document = new MockTextDocument(code);
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("Container")).toBe(true);
            expect(result.importInfo.hasStyledComponentsImport).toBe(true);
        });
        it("should detect styled components with function call syntax", () => {
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
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("CustomButton")).toBe(true);
            expect(result.styledComponents.has("StyledDiv")).toBe(true);
        });
        it("should detect component extensions", () => {
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
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("BaseButton")).toBe(true);
            expect(result.styledComponents.has("RedButton")).toBe(true);
        });
    });
    describe("Import handling", () => {
        it("should handle aliased imports", () => {
            const code = `
        import styledComponent from '@emotion/styled';
        
        const Button = styledComponent.div\`
          color: blue;
        \`;
      `;
            const document = new MockTextDocument(code);
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("Button")).toBe(true);
            expect(result.importInfo.styledIdentifier).toBe("styledComponent");
        });
        it("should handle named imports", () => {
            const code = `
        import { styled } from '@emotion/styled';
        
        const Header = styled.h1\`
          font-size: 24px;
        \`;
      `;
            const document = new MockTextDocument(code);
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("Header")).toBe(true);
        });
    });
    describe("JSX usage detection", () => {
        it("should find styled component usage in JSX", () => {
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
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("Button")).toBe(true);
            expect(result.tokens.length).toBe(2); // Two Button usages
            expect(result.tokens.every((token) => token.tokenType === "emotionStyledComponent")).toBe(true);
        });
        it("should handle self-closing JSX elements", () => {
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
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("Input")).toBe(true);
            expect(result.tokens.length).toBe(1);
        });
    });
    describe("Performance and edge cases", () => {
        it("should return empty result for files without emotion imports", () => {
            const code = `
        import React from 'react';
        
        const Button = () => <button>Click me</button>;
      `;
            const document = new MockTextDocument(code);
            const result = analyzer.analyze(document);
            expect(result.styledComponents.size).toBe(0);
            expect(result.tokens.length).toBe(0);
            expect(result.importInfo.hasEmotionImport).toBe(false);
        });
        it("should handle empty files", () => {
            const document = new MockTextDocument("");
            const result = analyzer.analyze(document);
            expect(result.styledComponents.size).toBe(0);
            expect(result.tokens.length).toBe(0);
        });
        it("should handle syntax errors gracefully", () => {
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
        it("should use cache for repeated analysis", () => {
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
        it("should handle multiple imports and complex component definitions", () => {
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
            const result = analyzer.analyze(document);
            expect(result.styledComponents.has("Button")).toBe(true);
            expect(result.styledComponents.has("Container")).toBe(true);
            expect(result.styledComponents.has("ExtendedButton")).toBe(true);
            expect(result.tokens.length).toBe(3); // Container, Button, ExtendedButton usage
        });
    });
});
//# sourceMappingURL=analyzer.test.js.map