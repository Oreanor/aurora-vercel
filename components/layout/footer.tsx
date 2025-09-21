interface Props {
  className?: string;
}

export default function Footer({ className = "" }: Props) {
  return (
    <footer className={`bg-gray-900 text-white py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            © 2023-2025 Aurora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
