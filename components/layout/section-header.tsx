interface SectionHeaderProps {
  id?: string;
  title: string;
  description: string;
  className?: string;
}

export default function SectionHeader({ 
  id, 
  title, 
  description, 
  className = '' 
}: SectionHeaderProps) {
  return (
    <div
      id={id}
      className={`scroll-mt-[120px] border-t border-gray-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70 ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300 md:text-lg">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

