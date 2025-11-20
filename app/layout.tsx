import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import AuthSessionProvider from "@/components/providers/session-provider";
import { TreeProvider } from "@/contexts/tree-context";
import ScrollToTop from "@/components/layout/scroll-to-top";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Aurora - Journey To Your Family History',
  description: 'Explore your ancestral past with AI-powered conversations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollToTop />
        <AuthSessionProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <TreeProvider>
              <Navbar />
              <main className="h-[calc(100vh-60px)] mt-15 overflow-y-auto">
                {children}
              </main>
            </TreeProvider>
          </Suspense>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
