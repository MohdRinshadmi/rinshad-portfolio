import type { Metadata } from "next";
import { Archivo_Black, Geist, Geist_Mono, Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GuideRails } from "@/components/layout/GuideRails";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { siteConfig } from "@/lib/config/site";
import { SITE_KEYWORDS, personJsonLd, jsonLdScript } from "@/lib/seo";

const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});
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
    default: `${siteConfig.fullName} — ${siteConfig.role}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.bio,
  keywords: SITE_KEYWORDS,
  authors: [{ name: siteConfig.fullName, url: siteConfig.url }],
  creator: siteConfig.fullName,
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/", "en": "/", "x-default": "/" },
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Palakkad, Kerala, India",
    "geo.position": "10.7867;76.6548",
    ICBM: "10.7867, 76.6548",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: `${siteConfig.fullName} — ${siteConfig.role}`,
    description: siteConfig.bio,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.fullName} — ${siteConfig.role}`,
    description: siteConfig.bio,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${inter.variable} ${instrument.variable} ${spaceGrotesk.variable} ${archivoBlack.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-bg font-sans text-text antialiased"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(personJsonLd()) }}
        />
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
