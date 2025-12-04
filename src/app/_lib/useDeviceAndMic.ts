"use client";

import { useCallback, useEffect, useState } from "react";
import { checkBackendConnection } from "./webexpApi";

export type DeviceType = "unknown" | "mobile" | "desktop";
export type MicStatus = "prompt" | "granted" | "denied";
export type BackendStatus = "unknown" | "checking" | "connected" | "disconnected";

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detect = () => {
      const ua = window.navigator.userAgent || "";
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        ua
      );
      const isSmallWidth = window.innerWidth <= 768;
      setDeviceType(isMobileUA || isSmallWidth ? "mobile" : "desktop");
    };

    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  return deviceType;
}

export function useMicPermission() {
  const [status, setStatus] = useState<MicStatus>("prompt");

  const request = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setStatus("denied");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setStatus("granted");
    } catch {
      setStatus("denied");
    }
  }, []);

  return { status, request };
}

export function useBackendConnection() {
  const [status, setStatus] = useState<BackendStatus>("unknown");
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setStatus("checking");
    setError(null);
    const result = await checkBackendConnection();
    if (result.connected) {
      setStatus("connected");
    } else {
      setStatus("disconnected");
      setError(result.error || "Could not connect to backend");
    }
  }, []);

  return { status, error, check };
}


