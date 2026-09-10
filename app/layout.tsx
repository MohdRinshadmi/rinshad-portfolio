import type { Metadata, Viewport } from "next";
import { Archivo_Black, Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GuideRails } from "@/components/layout/GuideRails";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { siteConfig } from "@/lib/config/site";
import { SITE_KEYWORDS, coreGraph } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
});
/* poster-grade heavy grotesque — the prologue masthead only */
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-archivo-black",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: SITE_KEYWORDS,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.fullName, url: siteConfig.url }],
  creator: siteConfig.fullName,
  publisher: siteConfig.fullName,
  category: "technology",
  // No hreflang `languages`: every entry pointed at "/", which tells search
  // engines nothing on a single-language site.
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${siteConfig.url}/feed.xml` },
  },
  // Apple home-screen / PWA presentation.
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
  // Phone numbers, emails etc. are intentional links — don't let Safari guess.
  formatDetection: { telephone: false, address: false, email: false },
  other: {
    "geo.region": siteConfig.geo.region,
    "geo.placename": siteConfig.geo.placename,
    "geo.position": `${siteConfig.geo.lat};${siteConfig.geo.lng}`,
    ICBM: `${siteConfig.geo.lat}, ${siteConfig.geo.lng}`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in the environment to emit the tag.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

/* Mobile browser chrome matches the paper canvas; the site is light-only. */
export const viewport: Viewport = {
  themeColor: "#f7f5f2",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${inter.variable} ${instrument.variable} ${archivoBlack.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-bg font-sans text-text antialiased"
        suppressHydrationWarning
      >
        {/* Site-wide linked-data graph: WebSite + Person + Organization.
            Emitted once here; every page references these nodes by @id. */}
        <JsonLd data={coreGraph()} />
        <SmoothScroll>
          <Navbar />
          <main id="main" className="relative">
            {children}
            <GuideRails />
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
