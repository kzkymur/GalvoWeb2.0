import React from "react";
import styled from "styled-components";
import AddNode from "./AddNode";

const Container = styled.div`
  position: relative;
  display: flex;
  background: white;
  border-bottom: 1px solid gray;
  z-index: 1300;
  padding-top: 8px;
`;

const Header: React.FC = () => (
  <Container>
    <AddNode />
  </Container>
);

export default Header;
