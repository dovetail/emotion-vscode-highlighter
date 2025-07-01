import React from 'react';
import styled from '@emotion/styled';

// Local styled components (should be detected by both AST and type checking)
const LocalButton = styled.button`
  background: blue;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
`;

const LocalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`;

export const LocalContainer2 = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 20,
});

// Function that returns a styled component
function createStyledInput() {
  return styled.input`
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 4px;
  `;
}

const DynamicInput = createStyledInput();

// Simulating imported styled components
// In a real scenario, these would come from another file like:
// import { ImportedCard, ImportedHeader } from './components/StyledComponents';

// For testing purposes, we'll create them here but imagine they're imported
const ImportedCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ImportedHeader = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0 0 16px 0;
`;

// Component that uses both local and "imported" styled components
export default function TypeCheckingTest() {
  return (
    <LocalContainer>
      <ImportedHeader>Type Checking Test</ImportedHeader>
      <LocalContainer2 />
      <ImportedCard>
        <p>This card tests type-based detection of styled components.</p>
        
        <LocalButton onClick={() => console.log('Local button clicked')}>
          Local Button
        </LocalButton>
        
        <DynamicInput 
          placeholder="Dynamic input from function"
          type="text"
        />
      </ImportedCard>
      
      <div>
        <p>Regular HTML elements should NOT be highlighted:</p>
        <button>Regular HTML Button</button>
        <input placeholder="Regular HTML Input" />
        <h2>Regular HTML Header</h2>
      </div>
      
      {/* Self-closing elements */}
      <LocalButton />
      <DynamicInput />
    </LocalContainer>
  );
}

// Additional test: Styled component with complex typing
interface StyledLinkProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const StyledLink = styled.a<StyledLinkProps>`
  color: ${props => props.variant === 'primary' ? '#007acc' : '#666'};
  font-size: ${props => {
    switch(props.size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '14px';
    }
  }};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export function ComplexStyledComponentTest() {
  return (
    <div>
      <StyledLink href="#" variant="primary" size="large">
        Primary Large Link
      </StyledLink>
      <StyledLink href="#" variant="secondary" size="small">
        Secondary Small Link
      </StyledLink>
    </div>
  );
} 