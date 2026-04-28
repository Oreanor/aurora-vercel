"use client";

import Image from "next/image";
import { Mic, MicOff, Video, VideoOff, ChevronDown } from "lucide-react";
import type { Person } from "@/types/family";
import { getPersonInitial, getPersonFullName, formatPersonYears } from "@/lib/utils";
import type { GeminiLiveStatus } from "@/hooks/use-gemini-live";
import type { SimliStatus } from "@/hooks/use-simli";

interface ContactHeaderProps {
  person: Person;
  role: string;
  voiceStatus: GeminiLiveStatus;
  videoStatus: SimliStatus;
  isVoiceOn: boolean;
  isVideoOn: boolean;
  onToggleVoice: () => void;
  onToggleVideo: () => void;
  onChangePerson: () => void;
}

export default function ContactHeader({
  person,
  role,
  voiceStatus,
  videoStatus,
  isVoiceOn,
  isVideoOn,
  onToggleVoice,
  onToggleVideo,
  onChangePerson,
}: ContactHeaderProps) {
  const initial = getPersonInitial(person);
  const fullName = getPersonFullName(person);
  const years = formatPersonYears(person);
  const gradient =
    person.gender === "female"
      ? "from-pink-400 to-rose-400"
      : "from-blue-400 to-green-400";

  const voiceConnecting = voiceStatus === "connecting";
  const videoConnecting = videoStatus === "loading";

  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
      {/* Avatar */}
      <div className="relative h-10 w-10 flex-shrink-0">
        {person.photo ? (
          <Image
            src={person.photo}
            alt={fullName}
            fill
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient}`}
          >
            <span className="text-sm font-semibold text-white">{initial}</span>
          </div>
        )}
        {/* online dot */}
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400 dark:border-gray-950" />
      </div>

      {/* Name + role */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {fullName}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {[role, years].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* Call controls */}
      <div className="flex items-center gap-2">
        {/* Voice toggle */}
        <button
          onClick={onToggleVoice}
          disabled={voiceConnecting}
          title={isVoiceOn ? "Выключить микрофон" : "Включить голос"}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
            isVoiceOn
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          {voiceConnecting ? (
            <Mic className="h-4 w-4 animate-pulse" />
          ) : isVoiceOn ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </button>

        {/* Video toggle */}
        <button
          onClick={onToggleVideo}
          disabled={videoConnecting}
          title={isVideoOn ? "Выключить видео" : "Включить видео"}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
            isVideoOn
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          {videoConnecting ? (
            <Video className="h-4 w-4 animate-pulse" />
          ) : isVideoOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </button>

        {/* Change person */}
        <button
          onClick={onChangePerson}
          title="Сменить персонажа"
          className="flex h-9 items-center gap-1 rounded-full bg-gray-100 px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
