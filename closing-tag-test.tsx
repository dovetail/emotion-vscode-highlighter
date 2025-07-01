import styled from '@emotion/styled';

const StyledButton = styled.button`
  background: blue;
  color: white;
`;

const StyledDiv = styled.div`
  padding: 20px;
  margin: 10px;
`;

function TestComponent() {
  return (
    <div>
      <StyledButton>Click me</StyledButton>
      <StyledDiv>
        <p>Content inside styled div</p>
      </StyledDiv>
    </div>
  );
}

export default TestComponent; 