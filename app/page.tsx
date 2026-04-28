"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { getButtonClasses } from "@/components/ui/button";
import ChatDemo from "@/components/features/chat-demo";
import DemoVideoSection from "@/components/features/demo-video-section";
import FeaturesPreview from "@/components/features/features-preview";
import HowToSteps from "@/components/features/how-to-steps";
import FutureFeatures from "@/components/features/future-features";
import Footer from "@/components/layout/footer";
import SectionHeader from "@/components/layout/section-header";
import { useI18n } from "@/components/providers/i18n-provider";

export default function Home() {
  const { data: session } = useSession();
  const { t } = useI18n();

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-700 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 pt-[110px]">
        <div className="text-center">

            <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
              {t("home.heroTitle")}
            </h2>

            <p className="mx-auto mt-8 max-w-4xl leading-relaxed text-gray-700 dark:text-gray-300">
              {t("home.heroIntro")}
            </p>

          <div className="mt-8 max-w-3xl mx-auto">
            <blockquote className="text-xl font-medium italic text-gray-800 md:text-2xl dark:text-gray-100">
              &quot;{t("home.heroQuote")}&quot;
            </blockquote>
          </div>

          <div className="mt-8 max-w-4xl mx-auto">
            <p className="mx-auto max-w-4xl leading-relaxed text-gray-700 dark:text-gray-300">
              {t("home.heroBody")}
            </p>
          </div>

          {/* CTA Buttons */}
          {!session && (
            <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signin"
                className={getButtonClasses(
                  "primary",
                  "lg",
                  "inline-block rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                )}
              >
                {t("home.primaryCta")}
              </Link>
            </div>
          )}
        </div>
      </div>
      <div
        id="chat-demo"
        className="scroll-mt-[60px] border-t border-gray-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                {t("home.demoTitle")}
              </h2>
              <p className="mx-auto mt-8 max-w-4xl leading-relaxed text-gray-700 dark:text-gray-300">
                {t("home.demoDescription")}
              </p>
            </div>

          <ChatDemo />
          
        </div>
      </div>

      <DemoVideoSection />

      {/* Aurora Features Section */}
      <SectionHeader
        id="features"
        title={t("home.featuresTitle")}
        description={t("home.featuresDescription")}
      />
      <FeaturesPreview />
      {/* How to Create Section */}
      <SectionHeader
        id="how-to"
        title={t("home.howToTitle")}
        description={t("home.howToDescription")}
      />

      <HowToSteps />

      {/* The Future Section */}
      <SectionHeader
        id="future"
        title={t("home.futureTitle")}
        description={t("home.futureDescription")}
      />

      <FutureFeatures />

      <Footer />
    </div>
  );
}
