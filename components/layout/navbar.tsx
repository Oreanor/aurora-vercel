"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface Props {
  className?: string;
}

export default function Navbar({ className = "" }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/chatroom", label: "Chatroom" },
    { href: "/family", label: "Family" },
    { href: "/tree", label: "Tree" },
    { href: "/stories", label: "My Stories" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-15 bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/aurora-logo.png"
              alt="Aurora Logo"
              width={192}
              height={96}
              className="h-auto w-32 object-contain"
              priority
              quality={100}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200"
              style={{ backgroundColor: "hsl(142, 76%, 55%)" }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200"
              style={{ backgroundColor: "hsl(142, 76%, 55%)" }}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Link
                  href="/signin"
                  className="block w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 text-center"
                  style={{ backgroundColor: "hsl(142, 76%, 55%)" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 text-center"
                  style={{ backgroundColor: "hsl(142, 76%, 55%)" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
