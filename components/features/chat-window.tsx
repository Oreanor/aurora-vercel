"use client";

import { useState, useRef, useEffect } from "react";
import { Person } from "@/types/family";
import { getPersonFullName, getPersonInitial, formatPersonYears } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWindowProps {
  selectedPerson: Person | null;
  role?: string;
  className?: string;
}

export default function ChatWindow({ selectedPerson, role = "", className = "" }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Сброс сообщений при смене персоны
  useEffect(() => {
    setMessages([]);
    setInputValue("");
  }, [selectedPerson?.id]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedPerson || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Добавляем сообщение пользователя сразу
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          person: selectedPerson,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your message. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedPerson) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="p-8 text-center text-gray-500">
          <p>Select a family member to start chatting</p>
        </div>
      </div>
    );
  }

  const fullName = getPersonFullName(selectedPerson);
  const initial = getPersonInitial(selectedPerson);
  const yearsDisplay = formatPersonYears(selectedPerson);

  // Цвет для аватара
  const getAvatarGradient = () => {
    if (selectedPerson.gender === "female") return "from-pink-400 to-rose-400";
    return "from-blue-400 to-green-400";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center`}>
            <span className="text-white text-xl font-semibold">{initial}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{fullName}</h3>
            <p className="text-sm text-gray-600">
              {yearsDisplay && `${yearsDisplay} • `}
              <span className="text-green-600 font-medium">Active now</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-2 ${message.isUser ? "justify-end" : ""}`}
            >
              {!message.isUser && (
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xs font-semibold">{initial}</span>
                </div>
              )}
              <div className={`flex-1 ${message.isUser ? "flex justify-end" : ""}`}>
                <div className={`max-w-sm ${message.isUser ? "flex flex-col items-end" : ""}`}>
                  <div
                    className={`rounded-xl px-3 py-2 ${
                      message.isUser
                        ? "bg-blue-500 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <p
                    className={`text-xs text-gray-500 mt-1 ${
                      message.isUser ? "text-right" : "ml-3"
                    }`}
                  >
                    {message.isUser ? "You" : fullName} • {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
              {message.isUser && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">Y</span>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex space-x-2">
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-xs font-semibold">{initial}</span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2 max-w-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="bg-transparent border-0 rounded-full placeholder-gray-500 focus:ring-0 shadow-none"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            variant="primary"
            className="rounded-full"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

