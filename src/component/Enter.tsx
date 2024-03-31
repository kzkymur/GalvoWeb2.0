import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import useWasmCode from "@/wasm";

type Props = {};

const Enter: React.FC<Props> = () => {
  // const [Module, setModule] = useState<any>(null);
  const [Module] = useState<any>(null);
  const navitgate = useNavigate();
  const toHomePage = () => {
    navitgate("/");
  };

  useWasmCode();

  return (
    <>
      <Link to="/">Home</Link> {/* これでページ遷移 */}
      <h1>Enterだよ！！</h1>
      <button onClick={toHomePage}>toHomePage!</button>{" "}
      {/* 間に処理噛ませたい時はこっち */}
      <button onClick={Module}>ccall!</button>{" "}
    </>
  );
};

export default Enter;
