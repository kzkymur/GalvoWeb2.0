import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Wasm from "@wasm";
import "./Home.css";
import { NodeField } from "./Node";
import { Nodes } from "./Nodes";
import { SetWasmModule } from "@/store/ctx/action";
import useNodeMap from "@/module/useNodeMap";
import AddNode from "./AddNode";

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const [nodeMap] = useNodeMap();
  useEffect(() => {
    Wasm().then((Module: any) => {
      dispatch(SetWasmModule(Module));
    });
  }, []);
  return (
    <NodeField>
      <AddNode />
      {Object.keys(nodeMap).map((id) => (
        <Nodes id={Number(id)} nodeKey={nodeMap[Number(id)]} key={id} />
      ))}
    </NodeField>
  );
};

export default Home;
