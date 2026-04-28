"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCallPageSelection } from "./use-call-page-selection";
import { useGeminiLive, type AudioChunk } from "@/hooks/use-gemini-live";
import { useSimli } from "@/hooks/use-simli";
import { useMicrophone } from "@/hooks/use-microphone";
import { usePcmPlayer } from "@/hooks/use-pcm-player";
import { sendChatMessage } from "@/lib/api/chat";
import { getPersonInitial, getPersonFullName } from "@/lib/utils";
import { translateFamilyRole } from "@/lib/i18n-role";
import { useI18n } from "@/components/providers/i18n-provider";
import ContactHeader from "@/components/features/chatroom/contact-header";
import VideoArea from "@/components/features/chatroom/video-area";
import PersonAutocomplete from "@/components/ui/person-autocomplete";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Image from "next/image";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  source?: "text" | "voice";
}

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function resamplePcm16(raw: Uint8Array, fromRate: number, toRate: number): Uint8Array {
  if (fromRate === toRate) return raw;
  const src = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
  const ratio = fromRate / toRate;
  const outLen = Math.round(src.length / ratio);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, src.length - 1);
    const t = pos - lo;
    out[i] = Math.round(src[lo] + (src[hi] - src[lo]) * t);
  }
  return new Uint8Array(out.buffer);
}

export default function ChatroomPage() {
  const { t, formatTime } = useI18n();
  const searchParams = useSearchParams();
  const selection = useCallPageSelection();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [showPersonPicker, setShowPersonPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── sync personId from URL ───────────────────────────────────────────────
  const personIdFromUrl = searchParams.get("personId");
  const { familyMembers, setSelectedPersonId } = selection;
  useEffect(() => {
    if (personIdFromUrl && familyMembers.some((m) => m.person.id === personIdFromUrl)) {
      setSelectedPersonId(personIdFromUrl);
    }
  }, [personIdFromUrl, familyMembers, setSelectedPersonId]);

  // ── reset on person change ───────────────────────────────────────────────
  useEffect(() => {
    setMessages([]);
    setIsVoiceOn(false);
    setIsVideoOn(false);
  }, [selection.selectedPersonId]);

  // ── scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [...prev, { ...msg, id: id(), timestamp: new Date() }]);
  }, []);

  // Refs tracking the in-progress streaming voice message IDs
  const streamingUserIdRef = useRef<string | null>(null);
  const streamingModelIdRef = useRef<string | null>(null);

  const upsertVoiceMessage = useCallback((
    idRef: React.MutableRefObject<string | null>,
    text: string,
    isUser: boolean,
    done: boolean,
  ) => {
    if (!idRef.current) {
      const msgId = id();
      idRef.current = msgId;
      setMessages((prev) => [...prev, { id: msgId, text, isUser, timestamp: new Date(), source: "voice" }]);
    } else {
      const msgId = idRef.current;
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, text } : m));
    }
    if (done) idRef.current = null;
  }, []);

  // ── PCM player (voice-only, no video) ────────────────────────────────────
  const pcmPlayer = usePcmPlayer();

  // ── Simli (video avatar) ─────────────────────────────────────────────────
  const simli = useSimli({ videoRef, audioRef });

  // ── Route Gemini audio → Simli or speaker ────────────────────────────────
  const handleAudioChunk = useCallback(
    (chunk: AudioChunk) => {
      if (isVideoOn) {
        // Simli expects 16kHz PCM16; Gemini outputs 24kHz — downsample first
        simli.sendAudio(resamplePcm16(chunk.raw, chunk.sampleRate, 16000));
      } else {
        pcmPlayer.playChunk(chunk.raw, chunk.sampleRate);
      }
    },
    [isVideoOn, simli, pcmPlayer]
  );

  // ── Gemini Live (voice) ───────────────────────────────────────────────────
  const gemini = useGeminiLive({
    person: selection.selectedPerson ?? ({} as never),
    role: selection.selectedPersonRole,
    onAudioChunk: handleAudioChunk,
    onUserTranscriptChunk: (text, done) => upsertVoiceMessage(streamingUserIdRef, text, true, done),
    onModelTranscriptChunk: (text, done) => upsertVoiceMessage(streamingModelIdRef, text, false, done),
  });

  // ── Microphone → Gemini ───────────────────────────────────────────────────
  const mic = useMicrophone({
    onChunk: (base64) => gemini.sendAudio(base64),
  });

  // ── Voice toggle ──────────────────────────────────────────────────────────
  const handleToggleVoice = useCallback(async () => {
    if (!selection.selectedPerson) return;
    if (isVoiceOn) {
      mic.stop();
      gemini.disconnect();
      pcmPlayer.stop();
      setIsVoiceOn(false);
    } else {
      try {
        await gemini.connect();
        await mic.start();
        setIsVoiceOn(true);
      } catch {
        gemini.disconnect();
        setIsVoiceOn(false);
      }
    }
  }, [isVoiceOn, selection.selectedPerson, mic, gemini, pcmPlayer]);

  // ── Video toggle ──────────────────────────────────────────────────────────
  const handleToggleVideo = useCallback(async () => {
    if (!selection.selectedPerson) return;
    if (isVideoOn) {
      simli.stop();
      setIsVideoOn(false);
    } else {
      setIsVideoOn(true);
      const res = await fetch("/api/video/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person: selection.selectedPerson }),
      });
      const { sessionToken, iceServers } = (await res.json()) as {
        sessionToken: string;
        iceServers: RTCIceServer[] | null;
      };
      await simli.start(sessionToken, iceServers);
      // Also start voice if not yet on
      if (!isVoiceOn) {
        await gemini.connect();
        await mic.start();
        setIsVoiceOn(true);
      }
    }
  }, [isVideoOn, isVoiceOn, simli, gemini, mic, selection.selectedPerson]);

  // ── Text send (Mistral) ───────────────────────────────────────────────────
  const handleSendText = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !selection.selectedPerson || isTextLoading) return;
    addMessage({ text, isUser: true, source: "text" });
    setInputValue("");
    setIsTextLoading(true);
    try {
      const { reply } = await sendChatMessage(text, selection.selectedPerson, selection.selectedPersonRole);
      addMessage({ text: reply, isUser: false, source: "text" });
    } catch {
      addMessage({ text: t("chat.sendError"), isUser: false, source: "text" });
    } finally {
      setIsTextLoading(false);
    }
  }, [inputValue, selection.selectedPerson, selection.selectedPersonRole, isTextLoading, addMessage, t]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (selection.signInRequired) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-slate-950">
        <p className="text-gray-600 dark:text-gray-300">{t("connect.signInRequired")}</p>
      </div>
    );
  }
  if (selection.treeRequired) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
        <p className="text-center text-gray-600 dark:text-gray-300">{t("connect.treeRequired")}</p>
      </div>
    );
  }

  const localizedRole = selection.selectedPersonRole
    ? translateFamilyRole(selection.selectedPersonRole, t)
    : "";

  // ── No person selected ────────────────────────────────────────────────────
  if (!selection.selectedPerson) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-gray-50 px-4 dark:bg-slate-950">
        <p className="text-center text-gray-600 dark:text-gray-300">{t("connect.personSelectLabels.chat")}</p>
        <PersonAutocomplete
          label=""
          persons={familyMembers.map(({ person }) => person)}
          value={selection.selectedPersonId}
          onChange={setSelectedPersonId}
          placeholder={t("connect.personSelectPlaceholder")}
          className="w-full max-w-sm"
        />
      </div>
    );
  }

  const { selectedPerson: person } = selection;
  const initial = getPersonInitial(person);
  const fullName = getPersonFullName(person);
  const gradient =
    person.gender === "female" ? "from-pink-400 to-rose-400" : "from-blue-400 to-green-400";

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-full justify-center bg-gray-100 dark:bg-slate-900">
    <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-sm dark:bg-gray-950">
      {/* Person picker overlay */}
      {showPersonPicker && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-black/40 pt-20 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Выберите персонажа</p>
            <PersonAutocomplete
              label=""
              persons={familyMembers.map(({ person }) => person)}
              value={selection.selectedPersonId}
              onChange={(id) => { setSelectedPersonId(id); setShowPersonPicker(false); }}
              placeholder={t("connect.personSelectPlaceholder")}
            />
            <button
              onClick={() => setShowPersonPicker(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <ContactHeader
        person={person}
        role={localizedRole}
        voiceStatus={gemini.status}
        videoStatus={simli.status}
        isVoiceOn={isVoiceOn}
        isVideoOn={isVideoOn}
        onToggleVoice={handleToggleVoice}
        onToggleVideo={handleToggleVideo}
        onChangePerson={() => setShowPersonPicker(true)}
      />

      {/* Video area (shown when video is on) */}
      {isVideoOn && (
        <VideoArea videoRef={videoRef} audioRef={audioRef} status={simli.status} />
      )}

      {/* Voice indicator (shown when voice is on but not video) */}
      {isVoiceOn && !isVideoOn && (
        <div className="flex items-center justify-center gap-3 border-b border-gray-100 bg-gray-50 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
            {person.photo ? (
              <Image src={person.photo} alt={fullName} fill className="rounded-full object-cover" unoptimized />
            ) : (
              <span className="text-white text-xl font-semibold">{initial}</span>
            )}
          </div>
          <div className="flex items-end gap-0.5 h-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-green-400 animate-pulse"
                style={{ height: `${10 + (i % 3) * 8}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Голосовой разговор</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-600 mt-8">
            {t("chat.noMessages")}
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.isUser ? "justify-end" : "justify-start"}`}>
            {!msg.isUser && (
              <div className={`h-6 w-6 flex-shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-white text-[10px] font-semibold">{initial}</span>
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
              msg.isUser
                ? "rounded-tr-sm bg-blue-500 text-white"
                : "rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={`mt-0.5 text-[10px] ${msg.isUser ? "text-blue-100" : "text-gray-400"}`}>
                {formatTime(msg.timestamp)}
                {msg.source === "voice" && " · 🎤"}
              </p>
            </div>
          </div>
        ))}
        {isTextLoading && (
          <div className="flex gap-2">
            <div className={`h-6 w-6 flex-shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white text-[10px] font-semibold">{initial}</span>
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 dark:bg-gray-800">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800">
            <Input
              type="text"
              placeholder={t("chat.typePlaceholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTextLoading}
              className="border-0 bg-transparent shadow-none focus:ring-0 placeholder-gray-500 text-sm"
            />
          </div>
          <Button
            onClick={handleSendText}
            disabled={!inputValue.trim() || isTextLoading}
            variant="primary"
            size="sm"
            className="rounded-full flex-shrink-0"
          >
            {t("common.send")}
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}
