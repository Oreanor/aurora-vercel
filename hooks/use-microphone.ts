"use client";

import { useRef, useCallback } from "react";

const TARGET_RATE = 16000;
const BUFFER_SIZE = 4096;

function downsample(input: Float32Array, fromRate: number): Float32Array {
  if (fromRate === TARGET_RATE) return input;
  const ratio = fromRate / TARGET_RATE;
  const out = new Float32Array(Math.round(input.length / ratio));
  for (let i = 0; i < out.length; i++) out[i] = input[Math.round(i * ratio)];
  return out;
}

function toInt16(input: Float32Array): Uint8Array {
  const buf = new ArrayBuffer(input.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(buf);
}

function toBase64(data: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < data.length; i++) bin += String.fromCharCode(data[i]);
  return btoa(bin);
}

interface UseMicrophoneOptions {
  /** Called for each ~256ms audio chunk: base64 PCM16@16kHz + raw bytes */
  onChunk: (base64: string, raw: Uint8Array) => void;
}

export function useMicrophone({ onChunk }: UseMicrophoneOptions) {
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processorRef = useRef<any>(null);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    streamRef.current = stream;

    const ctx = new AudioContext();
    contextRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    // ScriptProcessor is deprecated but widely supported; replace with AudioWorklet when ready
    const proc = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);
    processorRef.current = proc;

    proc.onaudioprocess = (e: AudioProcessingEvent) => {
      const float32 = e.inputBuffer.getChannelData(0);
      const resampled = downsample(float32, ctx.sampleRate);
      const raw = toInt16(resampled);
      onChunk(toBase64(raw), raw);
    };

    source.connect(proc);
    proc.connect(ctx.destination);
  }, [onChunk]);

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    contextRef.current?.close();
    contextRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  return { start, stop };
}
