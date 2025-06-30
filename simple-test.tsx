import styled from '@emotion/styled';
import React from 'react';

// Template literal syntax - should be highlighted
const Button = styled.button`
  background: blue;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
`;

// Object syntax - should be highlighted  
const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '20px'
});

// Function call syntax - should be highlighted
const Input = styled('input')`
  border: 1px solid gray;
  padding: 8px;
  border-radius: 4px;
`;

// Component extension - should be highlighted
const PrimaryButton = styled(Button)`
  background: #007ACC;
`;

// Usage in JSX - these should be highlighted in your chosen color!
function App() {
  return (
    <Container>
      <h1>🎨 Color Configuration Test</h1>
      <p>
        The styled components below should be highlighted in your chosen color:
      </p>
      
      <Button>Regular Button</Button>
      <PrimaryButton>Primary Button</PrimaryButton>
      <Input placeholder="Enter text here" />
      
      <div>
        <h2>How to change colors:</h2>
        <ol>
          <li>Open VS Code Settings (Ctrl/Cmd + ,)</li>
          <li>Search for "Emotion Highlighter"</li>
          <li>Set your preferred color (e.g., #ff69b4)</li>
          <li>Run: "Emotion Highlighter: Apply Color Settings" and choose an option</li>
        </ol>
      </div>
    </Container>
  );
}

export default App; 