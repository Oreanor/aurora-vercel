'use client';

export default function AnchorNavigation() {
  const links = [
    { href: '#chat-demo', label: 'Chat Demo' },
    { href: '#features', label: 'Features' },
    { href: '#how-to', label: 'How To' },
    { href: '#future', label: 'Future' },
  ];

  return (
    <div className="fixed top-[60px] left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-center gap-4 py-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-green-400 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

