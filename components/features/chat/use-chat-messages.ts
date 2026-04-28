"use client";

import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/api/chat";
import type { Person } from "@/types/family";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface UseChatMessagesOptions {
  selectedPerson: Person | null;
  role?: string;
  sendErrorMessage: string;
  onFirstResponse?: () => void;
}

export function useChatMessages({
  selectedPerson,
  role = "",
  sendErrorMessage,
  onFirstResponse,
}: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasCalledOnFirstResponse = useRef(false);

  useEffect(() => {
    setMessages([]);
    setInputValue("");
    hasCalledOnFirstResponse.current = false;
  }, [selectedPerson?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedPerson || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { reply } = await sendChatMessage(userMessage.text, selectedPerson, role);

      if (!hasCalledOnFirstResponse.current && onFirstResponse) {
        hasCalledOnFirstResponse.current = true;
        onFirstResponse();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: reply,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: sendErrorMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return {
    messages,
    inputValue,
    isLoading,
    messagesEndRef,
    setInputValue,
    handleSend,
    handleKeyDown,
  };
}
