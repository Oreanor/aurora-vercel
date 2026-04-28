"use client";

import { Person } from "@/types/family";
import { getPersonFullName, getPersonInitial, formatPersonYears } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { useChatMessages } from "@/components/features/chat/use-chat-messages";

interface ChatWindowProps {
  selectedPerson: Person | null;
  role?: string;
  className?: string;
}

export default function ChatWindow({ selectedPerson, role = "", className = "" }: ChatWindowProps) {
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
    sendErrorMessage: t("chat.sendError"),
  });

  if (!selectedPerson) {
    return (
      <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 md:rounded-2xl ${className}`}>
        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 md:p-8 md:text-base">
          <p>{t("chat.selectPrompt")}</p>
        </div>
      </div>
    );
  }

  const fullName = getPersonFullName(selectedPerson);
  const initial = getPersonInitial(selectedPerson);
  const yearsDisplay = formatPersonYears(selectedPerson);

  // Avatar color
  const getAvatarGradient = () => {
    if (selectedPerson.gender === "female") return "from-pink-400 to-rose-400";
    return "from-blue-400 to-green-400";
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 md:rounded-2xl ${className}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-2.5 dark:border-gray-800 dark:from-slate-900 dark:to-slate-800 md:px-6 md:py-4">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-base md:text-xl font-semibold">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white md:text-base">{fullName}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 md:text-sm">
              {yearsDisplay && `${yearsDisplay} • `}
              <span className="text-green-600 font-medium">{t("common.activeNow")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="min-h-[200px] max-h-[45vh] space-y-3 overflow-y-auto bg-white p-3 dark:bg-gray-900 md:min-h-[300px] md:max-h-[500px] md:space-y-4 md:p-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center px-2 text-center text-xs text-gray-400 dark:text-gray-500 md:min-h-[200px] md:text-sm">
            {t("chat.noMessages")}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-1.5 md:space-x-2 ${message.isUser ? "justify-end" : ""}`}
            >
              {!message.isUser && (
                <div
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-[10px] md:text-xs font-semibold">{initial}</span>
                </div>
              )}
              <div className={`flex-1 min-w-0 ${message.isUser ? "flex justify-end" : ""}`}>
                <div className={`max-w-[85%] md:max-w-sm ${message.isUser ? "flex flex-col items-end" : ""}`}>
                  <div
                    className={`rounded-lg md:rounded-xl px-2.5 py-1.5 md:px-3 md:py-2 ${
                      message.isUser
                        ? "bg-blue-500 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-tl-sm"
                    }`}
                  >
                    <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                  <p
                    className={`mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 md:mt-1 md:text-xs ${
                      message.isUser ? "text-right" : "ml-3"
                    }`}
                  >
                    {message.isUser ? t("common.you") : fullName} • {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
              {message.isUser && (
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] md:text-xs font-semibold">Y</span>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex space-x-1.5 md:space-x-2">
            <div
              className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-[10px] md:text-xs font-semibold">{initial}</span>
            </div>
            <div className="flex-1">
              <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-gray-100 px-2.5 py-1.5 dark:bg-gray-800 md:max-w-sm md:rounded-xl md:px-3 md:py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-800 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="min-w-0 flex-1 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800 md:px-4 md:py-2">
            <Input
              type="text"
              placeholder={t("chat.typePlaceholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="bg-transparent border-0 rounded-full placeholder-gray-500 focus:ring-0 shadow-none"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            variant="primary"
            size="sm"
            className="rounded-full flex-shrink-0"
          >
            {t("common.send")}
          </Button>
        </div>
      </div>
    </div>
  );
}

