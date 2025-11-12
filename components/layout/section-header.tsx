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
      className={`bg-white/50 backdrop-blur-sm border-t border-gray-200 scroll-mt-[120px] ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

