"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/button";

interface Props {
  className?: string;
}

export default function Navbar({ className = "" }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tree", label: "Tree" },
    { href: "/chatroom", label: "Chatroom" },
    { href: "/family", label: "Family" },
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-green-400'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center justify-end w-[260px]">
              {status === "loading" ? (
                <div className="h-8 w-full invisible" />
              ) : session ? (
                <div className="flex items-center space-x-3 w-full">
                  <div className="flex items-center space-x-2 min-w-0">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                  <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 flex-shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </Button>
                </div>
              ) : (
                <div className="w-full flex justify-end">
                  <Link href="/signin" className="w-[100px]">
                    <Button variant="primary" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
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
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-3 py-2 font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-green-400'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 space-y-2">
                {status === "loading" ? (
                  <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : session ? (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt="User Avatar"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {session.user?.name || session.user?.email}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="flex items-center justify-center space-x-1 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="block w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="primary" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
