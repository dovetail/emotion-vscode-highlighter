"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestComponent;
exports.SelfClosingTest = SelfClosingTest;
const react_1 = __importDefault(require("react"));
const styled_1 = __importDefault(require("@emotion/styled"));
// Test Case 1: Basic styled component
const Button = styled_1.default.button `
  background: blue;
  color: white;
`;
// Test Case 2: Styled component with element
const Container = styled_1.default.div `
  padding: 20px;
`;
// Test Case 3: Styled component with custom component
const StyledButton = (0, styled_1.default)(Button) `
  border: 1px solid red;
`;
// Test Case 4: Function that returns styled component
function createStyledDiv() {
    return styled_1.default.div `
    margin: 10px;
  `;
}
const DynamicDiv = createStyledDiv();
// Test Case 5: Multiple styled components
const Header = styled_1.default.h1 `
  font-size: 24px;
`;
const Footer = styled_1.default.footer `
  position: fixed;
  bottom: 0;
`;
// Test Case 6: JSX usage - this is what should be highlighted
function TestComponent() {
    return (<Container>
      <Header>Welcome</Header>
      <Button onClick={() => console.log('clicked')}>
        Click me
      </Button>
      <StyledButton>
        Styled Button
      </StyledButton>
      <DynamicDiv>
        Dynamic content
      </DynamicDiv>
      <Footer>
        Footer content
      </Footer>
      
      {/* Regular HTML elements - should NOT be highlighted */}
      <div>Regular div</div>
      <button>Regular button</button>
    </Container>);
}
// Test Case 7: Self-closing JSX
function SelfClosingTest() {
    return (<Container>
      <Button />
      <StyledButton />
    </Container>);
}
//# sourceMappingURL=test-emotion-debug.js.map