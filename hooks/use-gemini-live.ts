"use client";

import { useRef, useCallback, useState } from "react";
import { GoogleGenAI, Modality, type LiveServerMessage } from "@google/genai";
import type { Person } from "@/types/family";
import { generateSystemPrompt } from "@/lib/utils";

const MODEL = "gemini-2.5-flash-native-audio-latest";
const OUTPUT_SAMPLE_RATE = 24000;

export type GeminiLiveStatus = "idle" | "connecting" | "ready" | "error";

export interface AudioChunk {
  raw: Uint8Array;
  sampleRate: number;
}

interface UseGeminiLiveOptions {
  person: Person;
  role: string;
  onAudioChunk: (chunk: AudioChunk) => void;
  /** Called on every transcript chunk with accumulated text so far; done=true on the final chunk */
  onUserTranscriptChunk: (text: string, done: boolean) => void;
  onModelTranscriptChunk: (text: string, done: boolean) => void;
}

function base64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export function useGeminiLive({
  person,
  role,
  onAudioChunk,
  onUserTranscriptChunk,
  onModelTranscriptChunk,
}: UseGeminiLiveOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<any>(null);
  const isReadyRef = useRef(false); // ref so sendAudio never reads stale state
  const [status, setStatus] = useState<GeminiLiveStatus>("idle");

  // Refs so message handlers always call the latest callbacks (no stale closures)
  const personRef = useRef(person);
  const roleRef = useRef(role);
  const onAudioChunkRef = useRef(onAudioChunk);
  const onUserTranscriptChunkRef = useRef(onUserTranscriptChunk);
  const onModelTranscriptChunkRef = useRef(onModelTranscriptChunk);
  personRef.current = person;
  roleRef.current = role;
  onAudioChunkRef.current = onAudioChunk;
  onUserTranscriptChunkRef.current = onUserTranscriptChunk;
  onModelTranscriptChunkRef.current = onModelTranscriptChunk;

  // Partial transcript buffers
  const inputBufRef = useRef("");
  const outputBufRef = useRef("");

  const connect = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!key) {
        setStatus("error");
        reject(new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set"));
        return;
      }

      // Close any previous session
      sessionRef.current?.close?.();
      sessionRef.current = null;
      isReadyRef.current = false;
      inputBufRef.current = "";
      outputBufRef.current = "";

      setStatus("connecting");

      const ai = new GoogleGenAI({ apiKey: key });

      ai.live
        .connect({
          model: MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: generateSystemPrompt(personRef.current, roleRef.current),
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            temperature: 0.7,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: personRef.current.gender === "female" ? "Aoede" : "Charon",
                },
              },
            },
          },
          callbacks: {
            onopen: () => {
              isReadyRef.current = true;
              setStatus("ready");
              resolve();
            },
            onclose: (event: CloseEvent) => {
              isReadyRef.current = false;
              sessionRef.current = null;
              setStatus("idle");
              if (event.code !== 1000) {
                reject(new Error(`WebSocket closed (code ${event.code})`));
              }
            },
            onerror: (event: ErrorEvent) => {
              isReadyRef.current = false;
              sessionRef.current = null;
              setStatus("error");
              reject(new Error(event.message ?? "WebSocket error"));
            },
            onmessage: (msg: LiveServerMessage) => {
              // Audio inline data from model
              const audioData = msg.data;
              if (audioData) {
                onAudioChunkRef.current({
                  raw: base64ToUint8(audioData),
                  sampleRate: OUTPUT_SAMPLE_RATE,
                });
              }

              // User speech → text transcription (stream chunk by chunk)
              const inputTx = msg.serverContent?.inputTranscription;
              if (inputTx?.text) {
                inputBufRef.current += inputTx.text;
                const done = !!inputTx.finished;
                onUserTranscriptChunkRef.current(inputBufRef.current, done);
                if (done) inputBufRef.current = "";
              }

              // Model speech → text transcription (stream chunk by chunk)
              const outputTx = msg.serverContent?.outputTranscription;
              if (outputTx?.text) {
                outputBufRef.current += outputTx.text;
                const done = !!outputTx.finished;
                onModelTranscriptChunkRef.current(outputBufRef.current, done);
                if (done) outputBufRef.current = "";
              }

              // Fallback flush on turn end if finished never arrived
              if (msg.serverContent?.turnComplete) {
                if (inputBufRef.current) {
                  onUserTranscriptChunkRef.current(inputBufRef.current, true);
                  inputBufRef.current = "";
                }
                if (outputBufRef.current) {
                  onModelTranscriptChunkRef.current(outputBufRef.current, true);
                  outputBufRef.current = "";
                }
              }
            },
          },
        })
        .then((session) => {
          sessionRef.current = session;
        })
        .catch((err: unknown) => {
          setStatus("error");
          reject(err instanceof Error ? err : new Error(String(err)));
        });
    });
  }, []); // no deps — uses refs

  const disconnect = useCallback(() => {
    isReadyRef.current = false;
    sessionRef.current?.close?.();
    sessionRef.current = null;
    inputBufRef.current = "";
    outputBufRef.current = "";
    setStatus("idle");
  }, []);

  const sendAudio = useCallback((base64: string) => {
    if (!isReadyRef.current || !sessionRef.current) return;
    sessionRef.current.sendRealtimeInput({
      audio: { data: base64, mimeType: "audio/pcm;rate=16000" },
    });
  }, []); // no deps — uses refs

  const sendText = useCallback((text: string) => {
    if (!isReadyRef.current || !sessionRef.current) return;
    sessionRef.current.sendClientContent({
      turns: [{ role: "user", parts: [{ text }] }],
      turnComplete: true,
    });
  }, []); // no deps — uses refs

  return { status, connect, disconnect, sendAudio, sendText };
}
