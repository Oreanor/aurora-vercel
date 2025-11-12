"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function ChatDemo() {
  const { data: session } = useSession();
  
  return (
      <>
        {/* Chat Window */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">M</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Grandmother Mary</h3>
                <p className="text-sm text-gray-600">1923-1998 • <span className="text-green-600 font-medium">Active now</span></p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-4 space-y-4">
            {/* Grandmother's Message */}
            <div className="flex space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">M</span>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2 max-w-sm">
                  <p className="text-gray-800 text-sm">
                    Hello sweetheart! I&apos;ve been waiting so long to meet you. Your mother told me so much about you in her letters. I wish I could have held you when you were little.
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-3">2:34 PM</p>
              </div>
            </div>

            {/* User's Message */}
            <div className="flex space-x-2 justify-end">
              <div className="flex-1 flex justify-end">
                <div className="max-w-sm">
                  <div className="bg-blue-500 text-white rounded-xl rounded-tr-sm px-3 py-2">
                    <p className="text-sm">
                      Grandma, I never got to hear your voice or learn your stories. What was it like growing up during the Depression? What would you want me to know about our family?
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">You • 2:35 PM</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">Y</span>
              </div>
            </div>

            {/* Grandmother's Response */}
            <div className="flex space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">M</span>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2 max-w-sm">
                  <p className="text-gray-800 text-sm">
                    Oh honey, those were hard times but we found joy in small things. I want you to know that our family has always been strong - we helped our neighbors, never went to bed angry, and always made room at the table for one more. That strength lives in you too, dear one.
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-3">2:36 PM</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  className="bg-transparent border-0 rounded-full placeholder-gray-500 focus:ring-0 shadow-none"
                  disabled
                />
              </div>
              <Button
                variant="primary"
                className="rounded-full"
                disabled
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Below Chat */}
        <div className="text-center mt-8">
          <Link href={session ? "/chatroom" : "/signin"} className="inline-block">
            <Button
              variant="primary"
              size="lg"
              className="rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Start Your Own Family Chat
            </Button>
          </Link>
        </div>
      </>
  );
}
