import { Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import CursorPlus from "@/components/site/CursorPlus";
import { MotionProvider } from "@/components/motion/useReduced";
import { SITE_URL } from "@/lib/site";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const title = "Usman Nadeem | Senior Full-Stack Developer";
const description =
  "Usman Nadeem builds scalable SaaS platforms and enterprise systems with React, Next.js, Node and AWS. Software architect at Legit Design Studio, based in Kalispell, Montana.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "Usman Nadeem",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Usman Nadeem portfolio" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0B0D",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        {/* without JavaScript nothing animates in, so show everything */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}.iris-clip{clip-path:none!important}.iris-scrim{display:none!important}"}</style>
        </noscript>
        <a
          href="#main"
          className="btn btn-primary fixed left-4 top-3 z-skip -translate-y-24 focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <CursorPlus />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
