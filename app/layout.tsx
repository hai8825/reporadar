import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ComparisonTray } from "@/components/comparison-tray";
import { NavBar } from "@/components/nav-bar";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "RepoRadar",
  description:
    "GitHub repository discovery — search, assess health at a glance, save, and compare.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <Providers>
          <NavBar />
          {/* bottom padding keeps content clear of the fixed comparison tray */}
          <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">{children}</main>
          <ComparisonTray />
        </Providers>
      </body>
    </html>
  );
}
