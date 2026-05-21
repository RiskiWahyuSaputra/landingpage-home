import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import LenisProvider from "@/components/LenisProvider";
import GrainOverlay from "@/components/GrainOverlay";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Modern Forest Villa",
  description:
    "A cinematic architectural residence shaped by stone, wood, glass, and silence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.className} bg-stone-950 text-offwhite antialiased`}
      >
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <GrainOverlay />
        </LenisProvider>
      </body>
    </html>
  );
}
