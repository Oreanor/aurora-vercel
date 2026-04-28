"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createStory, getStory } from "@/lib/api/story";
import type { StoryStatusResponse } from "@/lib/api/story";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Image from "next/image";
import { Film, Sparkles, ImageIcon, Loader2, Play } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

export default function StoryPage() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [biography, setBiography] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyStatus, setStoryStatus] = useState<StoryStatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const data = await getStory(storyId);
        if (!cancelled) setStoryStatus(data);
      } catch (err) {
        if (!cancelled) setStatusError(err instanceof Error ? err.message : t("story.loadStatusError"));
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [storyId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biography.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createStory({
        title: title.trim() || undefined,
        subjectName: subjectName.trim() || undefined,
        biography: biography.trim(),
      });
      setStoryId(result.storyId);
      setStoryStatus({
        storyId: result.storyId,
        status: result.status,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("story.createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const localizedStatus = storyStatus ? t(`story.statuses.${storyStatus.status}`) : "";

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-slate-950">
        <p className="text-gray-600 dark:text-gray-300">{t("story.signInRequired")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("story.title")}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t("story.heroDescription")}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("story.heroHint")}
          </p>
        </div>

        {/* Step 1: Story details */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 dark:border-gray-800 dark:from-slate-900 dark:to-slate-800">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Sparkles className="h-5 w-5 text-green-500" />
              {t("story.sectionStoryTitle")}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t("story.sectionStoryDescription")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Input
              label={t("story.storyTitleLabel")}
              id="story-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("story.storyTitlePlaceholder")}
            />
            <Input
              label={t("story.storySubjectLabel")}
              id="story-subject"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder={t("story.storySubjectPlaceholder")}
            />
            <Textarea
              label={t("story.storyBodyLabel")}
              id="story-biography"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder={t("story.storyBodyPlaceholder")}
              rows={8}
              required
            />
            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
            <Button
              type="submit"
              disabled={!biography.trim() || isSubmitting}
              variant="primary"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("story.creating")}
                </>
              ) : (
                t("story.createButton")
              )}
            </Button>
          </form>
        </section>

        {/* Step 2: Scene previews — shown after submit */}
        {(storyId || storyStatus) && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 dark:border-gray-800 dark:from-slate-900 dark:to-slate-800">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <ImageIcon className="h-5 w-5 text-green-500" />
                {t("story.sectionScenesTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t("story.sectionScenesDescription")}
              </p>
            </div>
            <div className="p-6">
              {storyStatus?.scenes && storyStatus.scenes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {storyStatus.scenes.map((scene, i) => (
                    <div
                      key={scene.id}
                      className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                    >
                      {scene.thumbnailUrl ? (
                        <Image
                          src={scene.thumbnailUrl}
                          alt={scene.title ?? t("story.sceneLabel", { index: i + 1 })}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">{t("story.sceneLabel", { index: i + 1 })}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex h-20 w-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <span className="text-xs text-gray-400 dark:text-gray-500">{t("story.sceneLabel", { index: i })}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {t("story.scenesHelper")}
              </p>
            </div>
          </section>
        )}

        {/* Step 3: Progress */}
        {storyId && storyStatus && storyStatus.status !== "ready" && storyStatus.status !== "failed" && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
                {t("story.sectionProgressTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t("story.sectionProgressDescription")}
              </p>
            </div>
            <div className="p-6">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full bg-green-400 transition-all duration-500"
                  style={{ width: `${storyStatus.progress ?? 0}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t("story.statusLabel", {
                  status: localizedStatus,
                  progress: storyStatus.progress != null ? ` · ${storyStatus.progress}%` : "",
                })}
              </p>
              {statusError && (
                <p className="mt-1 text-sm text-amber-600">{statusError}</p>
              )}
            </div>
          </section>
        )}

        {/* Step 4: Playback */}
        {storyId && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 dark:border-gray-800 dark:from-slate-900 dark:to-slate-800">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Film className="h-5 w-5 text-green-500" />
                {t("story.sectionVideoTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t("story.sectionVideoDescription")}
              </p>
            </div>
            <div className="p-6">
              {storyStatus?.status === "ready" && storyStatus.videoUrl ? (
                <div className="aspect-video rounded-lg bg-black overflow-hidden">
                  <video
                    src={storyStatus.videoUrl}
                    controls
                    className="w-full h-full"
                  >
                    <track kind="captions" />
                  </video>
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <Play className="mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">{t("story.videoPending")}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
