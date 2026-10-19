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
  title: "Batch Studio Video Editor — 2K SRT Video Generator",
  description:
    "Transform split storyboard images and voiceover .srt files into hardware-accelerated 2K MP4 video with multi-animation transitions & sound effects directly in your browser with MongoDB project sync.",
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
      <body className="min-h-full flex flex-col font-sans bg-[#0b0c10] text-slate-100 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-950/20 via-[#0c0d14] to-[#08080c] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
