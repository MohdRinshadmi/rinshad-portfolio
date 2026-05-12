import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { siteConfig } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rinshad.dev"),
  title: {
    default: `${siteConfig.fullName} — ${siteConfig.role}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.bio,
  keywords: [
    "Full-Stack Engineer",
    "Next.js Developer",
    "TypeScript",
    "React",
    "Node.js",
    "Dubai",
    siteConfig.fullName,
  ],
  authors: [{ name: siteConfig.fullName }],
  creator: siteConfig.fullName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rinshad.dev",
    title: `${siteConfig.fullName} — ${siteConfig.role}`,
    description: siteConfig.bio,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.fullName} — ${siteConfig.role}`,
    description: siteConfig.bio,
    creator: "@rinshad",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-full bg-[#080808] font-(--font-inter) text-white antialiased">
        <SmoothScroll>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
