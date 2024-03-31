import React, { useMemo } from "react";
import OriginalCameraVideo from "./OriginalCameraVideo";
import CalibratedCamera from "./CameraCalibratedCamera";
import CameraDeviceSelector from "./CameraDeviceSelector";
import Node, { NodeId } from "./Node";
import { CanvasId } from "@/store/ctx";
import { ValueOf } from "@/util";

export const CameraVideoNode: React.FC<{ id: NodeId & CanvasId }> = (props) => (
  <Node id={props.id} name="Camera Video">
    <OriginalCameraVideo {...props} />
    <CameraDeviceSelector id={props.id} />
  </Node>
);

export const CalibratedCameraNode: React.FC<{ id: NodeId & CanvasId }> = (
  props
) => (
  <Node id={props.id} name="Calibrated Camera">
    <CalibratedCamera {...props} />
  </Node>
);

export const NodeList = {
  CameraVideo: CameraVideoNode,
  CalibrateCamera: CalibratedCameraNode,
} as const;

export type Node = ValueOf<typeof NodeList>;
export type NodeKey = keyof typeof NodeList;

export const isNodeKey = (v: string): v is NodeKey =>
  Object.keys(NodeList).includes(v);

type Props = {
  nodeKey: NodeKey;
  id: NodeId;
};
export const Nodes: React.FC<Props> = (props) => {
  const Component = useMemo(() => NodeList[props.nodeKey], [props.nodeKey]);
  return <Component id={props.id} />;
};
