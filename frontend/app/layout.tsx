import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import SessionSync from "@/components/SessionSync";
import CursorFollower from "@/components/CursorFollower";
import SmoothScroll from "@/components/SmoothScroll";
import { Analytics } from "@vercel/analytics/next"

const chillax = localFont({
  src: "../public/fonts/Chillax-Regular.otf",
  variable: "--font-chillax",
});

const clash = localFont({
  src: "../public/fonts/ClashDisplay-Regular.otf",
  variable: "--font-clash",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "FinAnalysis | Premium Portfolio Distribution & Goal-Based Investment Structuring by Arijit De",
    template: "%s | FinAnalysis - Arijit De",
  },
  description: "Advanced financial analysis, SEBI-compliant portfolio distribution, calculator widgets, and custom wealth creation strategies. Optimize your mutual funds, PMS, and direct investments with Arijit De.",
  keywords: ["FinAnalysis", "Arijit De", "Portfolio Distribution", "Wealth Management", "SIP Calculator", "Pms Distribution", "Mutual Funds India", "Goal-Based Investment Structuring"],
  authors: [{ name: "Arijit De", url: "https://finanalysis.site" }],
  creator: "Arijit De",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://finanalysis.site"),
  openGraph: {
    title: "FinAnalysis | Premium Portfolio Distribution & Goal-Based Investment Structuring by Arijit De",
    description: "Advanced portfolio health report, SEBI-compliant distribution, interactive calculators, and customized wealth strategy tools. Secure your financial future with expert-led distribution.",
    url: "https://finanalysis.site",
    siteName: "FinAnalysis",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinAnalysis | Portfolio Distribution & Wealth Strategies",
    description: "Custom wealth building strategy tools, calculators, and portfolio distribution led by Arijit De.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        chillax.variable,
        clash.variable,
        instrumentSerif.variable,
        "font-clash"
      )}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <SessionSync />
        <Analytics />
        <CursorFollower />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
