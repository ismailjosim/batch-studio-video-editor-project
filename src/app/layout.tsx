import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Batch Studio Suite by JC Design — 2K Video, Whisper AI & Subtitle Studio",
  description:
    "All-in-one AI creative suite: Hardware-accelerated 2K MP4 video generator, Whisper Large-v3 speech-to-text transcriber, waveform-precise subtitle synchronization, and voiceover studio.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=JetBrains+Mono:wght@400;500;600;700&family=Montserrat:wght@700;800;900&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <Script src="/sfx-bundle.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#090a10] text-slate-100 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-cyan-950/15 via-[#0a0b12] to-[#07080d] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
