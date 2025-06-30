import styled from '@emotion/styled';

const Button = styled.button`
  background: pink;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
`;

const Container = styled.div`
  padding: 20px;
`;

function App() {
  return (
    <Container>
      <Button>Click me!</Button>
      <Button>Another button</Button>
    </Container>
  );
}

export default App; 