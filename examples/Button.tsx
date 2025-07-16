









import React from "react";
import styled from "@emotion/styled";

export default ({ onClick, label }: { onClick: () => void; label: string }) => (
  <StyledButton onClick={onClick}>{label}</StyledButton>
);

export const StyledButton = styled.button`
  background-color: hotpink;
  color: rebeccapurple;
`;