"use client";

import { useRef, useCallback } from "react";

function pcmToFloat32(raw: Uint8Array): Float32Array {
  // slice() returns ArrayBuffer (not SharedArrayBuffer), required by Int16Array constructor
  const buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer;
  const int16 = new Int16Array(buf);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
  return float32;
}

/** Plays queued PCM16 chunks sequentially via AudioContext. Supports any sample rate. */
export function usePcmPlayer() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nextStartRef = useRef(0);

  const getCtx = useCallback((sampleRate: number) => {
    if (!ctxRef.current || ctxRef.current.state === "closed" || ctxRef.current.sampleRate !== sampleRate) {
      ctxRef.current?.close();
      ctxRef.current = new AudioContext({ sampleRate });
      nextStartRef.current = 0;
    }
    return ctxRef.current;
  }, []);

  const playChunk = useCallback((raw: Uint8Array, sampleRate: number) => {
    const ctx = getCtx(sampleRate);
    const float32 = pcmToFloat32(raw);
    const buffer = ctx.createBuffer(1, float32.length, sampleRate);
    buffer.copyToChannel(new Float32Array(float32), 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const start = Math.max(now, nextStartRef.current);
    source.start(start);
    nextStartRef.current = start + buffer.duration;
  }, [getCtx]);

  const stop = useCallback(() => {
    ctxRef.current?.close();
    ctxRef.current = null;
    nextStartRef.current = 0;
  }, []);

  return { playChunk, stop };
}
