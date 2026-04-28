"use client";

import { useRef, useCallback, useState } from "react";
import type { SimliClient } from "simli-client";

export type SimliStatus = "idle" | "loading" | "ready" | "error";

interface UseSimliOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function useSimli({ videoRef, audioRef }: UseSimliOptions) {
  const clientRef = useRef<SimliClient | null>(null);
  const [status, setStatus] = useState<SimliStatus>("idle");

  /** sessionToken and iceServers come from /api/video/session — API key stays server-side */
  const start = useCallback(
    async (sessionToken: string, iceServers: RTCIceServer[] | null) => {
      if (!videoRef.current || !audioRef.current) return;
      setStatus("loading");
      try {
        const { SimliClient } = await import("simli-client");
        const client = new SimliClient(
          sessionToken,
          videoRef.current,
          audioRef.current,
          iceServers
        );

        client.on("start", () => setStatus("ready"));
        client.on("stop", () => setStatus("idle"));
        client.on("startup_error", () => setStatus("error"));
        client.on("error", () => setStatus("error"));

        await client.start();
        clientRef.current = client;
      } catch {
        setStatus("error");
      }
    },
    [videoRef, audioRef]
  );

  const stop = useCallback(async () => {
    await clientRef.current?.stop();
    clientRef.current = null;
    setStatus("idle");
  }, []);

  const sendAudio = useCallback(
    (raw: Uint8Array) => {
      if (status !== "ready" || !clientRef.current) return;
      clientRef.current.sendAudioData(raw);
    },
    [status]
  );

  return { status, start, stop, sendAudio };
}
