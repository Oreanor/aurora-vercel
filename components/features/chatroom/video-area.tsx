"use client";

import { useRef } from "react";
import { Video } from "lucide-react";
import type { SimliStatus } from "@/hooks/use-simli";

interface VideoAreaProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  status: SimliStatus;
}

export default function VideoArea({ videoRef, audioRef, status }: VideoAreaProps) {
  return (
    <div className="relative flex items-center justify-center border-b border-gray-200 bg-gray-950 dark:border-gray-800" style={{ height: 240 }}>
      {/* Simli video stream */}
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        autoPlay
        playsInline
        className="h-full w-full object-contain"
        style={{ display: status === "ready" ? "block" : "none" }}
      />
      {/* Hidden audio element required by Simli SDK */}
      <audio ref={audioRef as React.RefObject<HTMLAudioElement>} autoPlay style={{ display: "none" }} />

      {/* Loading / error overlay */}
      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Video className="h-10 w-10" />
          <p className="text-sm">
            {status === "loading" ? "Подключаем аватар…" : status === "error" ? "Ошибка подключения" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
