import type { Metadata, Viewport } from "next";
import { Anton, Barlow, JetBrains_Mono } from "next/font/google";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { EVENT } from "@/lib/event";
import { IGNITION_KEY } from "@/lib/constants";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const barlow = Barlow({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Destroy The Decibel (DTD) — The Battle of Exhausts. A car exhaust sound competition by the Department of CSE, Vidya Academy of Science and Technology, Thrissur. October 17, 2026. ₹40,000 prize pool.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Destroy The Decibel — The Battle of Exhausts | 17 Oct 2026",
    template: "%s | Destroy The Decibel",
  },
  description,
  applicationName: EVENT.name,
  authors: EVENT.developers.map(({ name }) => ({ name })),
  keywords: [
    "Destroy The Decibel",
    "DTD",
    "Battle of Exhausts",
    "exhaust sound competition",
    "Vidya Academy of Science and Technology",
    "Thrissur",
  ],
  openGraph: {
    type: "website",
    siteName: EVENT.name,
    title: "Destroy The Decibel — The Battle of Exhausts",
    description,
    locale: "en_IN",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Destroy The Decibel — The Battle of Exhausts",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070A",
  colorScheme: "dark",
};

// Runs before first paint: skip the loader for returning visitors and for
// people who prefer reduced motion, so it never flashes.
const ignitionScript = `try{if(sessionStorage.getItem(${JSON.stringify(
  IGNITION_KEY,
)})||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.ignited="1"}}catch(e){document.documentElement.dataset.ignited="1"}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${barlow.variable} ${jetbrains.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ignitionScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="label-tech sr-only z-[100] bg-fire px-4 py-3 text-obsidian focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <SoundToggle />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
