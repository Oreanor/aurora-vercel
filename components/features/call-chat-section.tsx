"use client";

import { Person } from "@/types/family";
import { getPersonInitial } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { useChatMessages } from "@/components/features/chat/use-chat-messages";

interface CallChatSectionProps {
  selectedPerson: Person | null;
  role?: string;
  onFirstResponse?: () => void;
  className?: string;
}

export default function CallChatSection({
  selectedPerson,
  role = "",
  onFirstResponse,
  className = "",
}: CallChatSectionProps) {
  const { t, formatTime } = useI18n();
  const {
    messages,
    inputValue,
    isLoading,
    messagesEndRef,
    setInputValue,
    handleSend,
    handleKeyDown,
  } = useChatMessages({
    selectedPerson,
    role,
    onFirstResponse,
    sendErrorMessage: t("chat.sendError"),
  });

  if (!selectedPerson) return null;

  const initial = getPersonInitial(selectedPerson);
  const gradient =
    selectedPerson.gender === "female" ? "from-pink-400 to-rose-400" : "from-blue-400 to-green-400";

  return (
    <div className={`border-t border-gray-200 ${className}`}>
      <p className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-600">
        {t("chat.orTypeInstead")}
      </p>
      <div className="px-4 md:px-6 pb-3 md:pb-4 max-h-36 md:max-h-48 overflow-y-auto space-y-1.5 md:space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs md:text-sm text-gray-400 italic">{t("chat.compactEmpty")}</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-1.5 md:gap-2 ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              {!message.isUser && (
                <div
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-[10px] md:text-xs font-semibold">{initial}</span>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-2.5 py-1 md:px-3 md:py-1.5 text-xs md:text-sm ${
                  message.isUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-[10px] md:text-xs mt-0.5 ${message.isUser ? "text-blue-100" : "text-gray-500"}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-1.5 md:gap-2">
            <div
              className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-[10px] md:text-xs font-semibold">{initial}</span>
            </div>
            <div className="bg-gray-100 rounded-lg px-3 py-1.5 flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 md:px-6 pb-3 md:pb-4 flex gap-2">
        <Input
          type="text"
          placeholder={t("chat.typePlaceholder")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 min-w-0 text-sm md:text-base"
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          variant="primary"
          size="sm"
          className="flex-shrink-0"
        >
          {t("common.send")}
        </Button>
      </div>
    </div>
  );
}
