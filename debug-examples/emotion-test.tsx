import React from 'react';
import styled from '@emotion/styled';

// Test Case 1: Basic styled component
const Button = styled.button`
  background: blue;
  color: white;
`;

// Test Case 2: Styled component with element
const Container = styled.div`
  padding: 20px;
`;

// Test Case 3: Styled component with custom component
const StyledButton = styled(Button)`
  border: 1px solid red;
`;

// Test Case 4: Function that returns styled component
function createStyledDiv() {
  return styled.div`
    margin: 10px;
  `;
}

const DynamicDiv = createStyledDiv();

// Test Case 5: Multiple styled components
const Header = styled.h1`
  font-size: 24px;
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
`;

// Test Case 6: JSX usage - this is what should be highlighted
export default function TestComponent() {
  return (
    <Container>
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
    </Container>
  );
}

// Test Case 7: Self-closing JSX
export function SelfClosingTest() {
  return (
    <Container>
      <Button />
      <StyledButton />
    </Container>
  );
} 