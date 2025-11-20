"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import ChatDemo from "@/components/features/chat-demo";
import FeaturesPreview from "@/components/features/features-preview";
import HowToSteps from "@/components/features/how-to-steps";
import FutureFeatures from "@/components/features/future-features";
import Footer from "@/components/layout/footer";
import SectionHeader from "@/components/layout/section-header";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 pt-[110px]">
        <div className="text-center">

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Chat with your ancestors you never knew through AI
            </h2>

            <p className="max-w-4xl mx-auto leading-relaxed mt-8">
              Imagine sharing stories with your great-grandmother again, watching your life unfold as a beautiful visual journey, or keeping precious family memories safe forever. Aurora brings families closer together across generations with the warmth of AI magic.
            </p>

          <div className="mt-8 max-w-3xl mx-auto">
            <blockquote className="text-xl md:text-2xl font-medium text-gray-800 italic">
            &quot;What if you could keep your family close, always?&quot;
            </blockquote>
          </div>

          <div className="mt-8 max-w-4xl mx-auto">
            <p className="max-w-4xl mx-auto leading-relaxed">

              Aurora creates cozy digital spaces for your family. Build loving AI companions based on your cherished family members, share stories and memories, then enjoy heartwarming conversations that feel wonderfully real. Turn your life stories into beautiful visual tales and keep all your family treasures safe. Create a warm digital home for generations to come.
            </p>
          </div>

          {/* CTA Buttons */}
          {!session && (
            <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signin" className="inline-block">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                >
                  Start Your Journey
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div id="chat-demo" className="bg-white/50 backdrop-blur-sm border-t border-gray-200 scroll-mt-[60px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Start Your First Heartwarming Chat Free
              </h2>
              <p className="max-w-4xl mx-auto leading-relaxed mt-8">
                AI-generated ancestor conversation demo - Grandmother Mary from 1920s family history
              </p>
            </div>

          <ChatDemo />
          
        </div>
      </div>

      {/* Aurora Features Section */}
      <SectionHeader
        id="features"
        title="Aurora Features: Reconnect with Cherished Family"
        description="Experience heartwarming AI-powered family connections that go beyond traditional family tree research. Aurora creates warm conversations with beloved family members, preserves precious memories through beautiful visual storytelling, and helps you feel closer to your family heritage through loving artificial intelligence."
      />
      <FeaturesPreview />
      {/* How to Create Section */}
      <SectionHeader
        id="how-to"
        title="How to Create Warm Family Connections"
        description="Creating heartwarming conversations with your cherished family members is easier than you think. Here's the simple 3-step process that transforms precious memories into cozy digital experiences."
      />

      <HowToSteps />

      {/* The Future Section */}
      <SectionHeader
        id="future"
        title="The Future of Family History"
        description="We're constantly innovating to bring you even more immersive ways to connect with your ancestors. Here's what's coming next in Aurora:"
      />

      <FutureFeatures />

      <Footer />
    </div>
  );
}
