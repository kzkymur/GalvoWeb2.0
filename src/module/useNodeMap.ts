import { NodeKey } from "@/component/Nodes";
import { useStore } from "./useStore";
import { useCallback } from "react";
import { NodeId } from "@/component/Node";

type NodeMap = Record<NodeId, NodeKey>;

const nodeMapKey = "node-map";
const latestNodeIdKey = "latest-node-id";

const useNodeMap = (): [
  NodeMap,
  (n: NodeKey) => void,
  (id: NodeId) => void
] => {
  const [nodeMap, setNodeMap] = useStore<NodeMap>(nodeMapKey, undefined, {});
  const [latestNodeId, setLatestNodeId] = useStore<NodeId>(
    latestNodeIdKey,
    undefined,
    1
  );

  const add = useCallback(
    (nodeKey: NodeKey) => {
      setNodeMap({
        ...nodeMap,
        [latestNodeId!]: nodeKey,
      });
      setLatestNodeId(latestNodeId! + 1);
    },
    [latestNodeId, nodeMap]
  );

  const del = useCallback(
    (nodeId: NodeId) => {
      const copyNodeMap = { ...nodeMap };
      delete copyNodeMap[nodeId];
      setNodeMap(copyNodeMap);
    },
    [nodeMap]
  );

  return [nodeMap!, add, del];
};

export default useNodeMap;
