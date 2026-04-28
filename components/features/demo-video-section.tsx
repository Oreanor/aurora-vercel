"use client";

import { useI18n } from "@/components/providers/i18n-provider";

interface Props {
  /** Local video path (e.g. /demo-video.mp4). Renders HTML5 video. */
  readonly videoSrc?: string;
  /** YouTube video ID for embed (e.g. "dQw4w9WgXcQ"). Takes precedence over videoSrc. */
  readonly youtubeId?: string;
  readonly className?: string;
}

export default function DemoVideoSection({
  videoSrc = "/demo-video.mp4",
  youtubeId,
  className = "",
}: Props) {
  const { t } = useI18n();

  return (
    <section
      id="demo-video"
      className={`scroll-mt-[120px] border-t border-gray-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70 ${className}`}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="mb-3 text-xl font-bold text-gray-900 md:mb-6 md:text-3xl dark:text-white">
            {t("demoVideo.title")}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300 md:text-lg">
            {t("demoVideo.description")}
          </p>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-xl dark:border-slate-700 dark:bg-slate-900 md:rounded-2xl">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={t("demoVideo.iframeTitle")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <video
              src={videoSrc}
              controls
              playsInline
              className="w-full h-full object-contain"
              preload="metadata"
            >
              <track kind="captions" />
              {t("demoVideo.videoUnsupported")}
            </video>
          )}
        </div>
      </div>
    </section>
  );
}
