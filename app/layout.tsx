import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ComparisonTray } from "@/components/comparison-tray";
import { NavBar } from "@/components/nav-bar";
import { Providers } from "@/components/providers";
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from "@/lib/themes";
import "./globals.css";

// Apply the saved theme before first paint so there's no flash of the default.
// Runs synchronously in <head>, ahead of hydration. The allow-list is derived
// from THEMES so it can't drift when a theme is added.
const noFlashThemeScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var ok=${JSON.stringify(
  THEMES.map((t) => t.id),
)};if(t&&ok.indexOf(t)>-1){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

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
    // suppressHydrationWarning: the inline script may change data-theme before
    // React hydrates, which is expected and not a real mismatch.
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
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
