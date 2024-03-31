import { useCallback, useEffect, useState } from "react";
import useCounter from "./useCounter";
import useInterval from "./useInterval";
import { useStore } from "./useStore";
import { CanvasId } from "@/store/ctx";

export type Resolution = {
  w: number;
  h: number;
};

export const resolution1080p = {
  w: 1920,
  h: 1080,
} as const;

export const resolutionSXGA = {
  w: 1280,
  h: 960,
} as const;

export const resolution720p = {
  w: 1280,
  h: 720,
} as const;

export const resolutionXGA = {
  w: 1024,
  h: 768,
} as const;

export const resolutionSVGA = {
  w: 800,
  h: 600,
} as const;

export const resolutionSDTV = {
  w: 720,
  h: 480,
} as const;

export const resolutionVGA = {
  w: 640,
  h: 480,
} as const;

export const playCameraMovie = async (
  video: HTMLVideoElement,
  deviceId: string,
  setResolution: (r: Resolution) => void = () => {}
) => {
  video.srcObject = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      deviceId,
      width: { ideal: resolution1080p.w },
      height: { ideal: resolution1080p.h },
    },
  });
  try {
    await video.play();
  } catch {}
  setResolution({ w: video.videoWidth, h: video.videoHeight });
};

const getDeviceList = async (): Promise<MediaDeviceInfo[]> => {
  const list = await navigator.mediaDevices.enumerateDevices();
  return list.filter((d) => d.label);
};

export const useCameraDeviceList = (updateInterval: number = 1000) => {
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [trigger, update] = useCounter();
  useInterval(update, updateInterval);
  const asyncSetDeviceList = useCallback(async () => {
    setDeviceList(await getDeviceList());
  }, []);
  useEffect(() => {
    asyncSetDeviceList();
  }, [trigger]);
  return deviceList;
};

const DEVICEID_STORE_KEY = "camera-device-id";

export const useDeviceId = (
  targetCanvasId?: CanvasId
): [string | null, (deviceId: string) => void] => {
  const [deviceId, update] = useStore(DEVICEID_STORE_KEY, targetCanvasId, "");
  return [deviceId, update];
};

export const useCameraDevice = (
  targetCanvasId?: CanvasId
): [MediaDeviceInfo[], string | null, (deviceId: string) => void] => {
  const deviceList = useCameraDeviceList();
  const [deviceId, setDeviceId] = useDeviceId(targetCanvasId);
  const select = useCallback(
    (deviceId: string | null) => {
      if (deviceId === null) return;
      if (!deviceList.some((d) => d.deviceId === deviceId)) {
        throw Error("deviceId not found");
      }
      setDeviceId(deviceId);
    },
    [deviceList]
  );
  return [deviceList, deviceId, select];
};
