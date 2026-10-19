import type { Metadata } from "next";
import { JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfitHeading = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

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
    <html
      lang="en"
      className={`${jakartaSans.variable} ${outfitHeading.variable} ${monoFont.variable} dark h-full antialiased overflow-x-hidden`}
    >
      <head>
        <Script src="/sfx-bundle.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#090a10] text-slate-100 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-cyan-950/15 via-[#0a0b12] to-[#07080d] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
