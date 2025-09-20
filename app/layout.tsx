import type { Metadata } from "next";
import { Hind_Siliguri, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import ogImage from "@/public/opengraph-image.png";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Learn Top Skills with Skilltori",
    template: "%s | Skilltori",
  },
  description: "Learn top skills from industry experts with Skilltori. Our courses are designed to help you gain the skills you need to succeed in your career.",
  keywords: [
    "skilltori",
    "skilltori bangladesh",
    "skilltori online",
    "skilltori online course",
    "skilltori online course bangladesh",
    "skilltori online course in bangladesh",
  ],
  authors: [
    {
      name: "Skilltori",
      url: "https://skilltori.com"
    }
  ],
  creator: "Skilltori",
  publisher: "Skilltori",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://skilltori.com"),
  alternates: {
    canonical: "https://skilltori.com",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    title: "Skilltori - Learn Top Skills with Skilltori",
    description:
      "Learn top skills from industry experts with Skilltori. Our courses are designed to help you gain the skills you need to succeed in your career.",
    url: "https://skilltori.com",
    siteName: "Skilltori",
    images: [
      {
        url: ogImage.src,
        alt: "Skilltori - Learn Top Skills with Skilltori",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skilltori - Learn Top Skills with Skilltori",
    description:
      "Learn top skills from industry experts with Skilltori. Our courses are designed to help you gain the skills you need to succeed in your career.",
    creator: "@skilltori",
    site: "@skilltori",
    images: [
      {
        url: ogImage.src,
        alt: "Skilltori - Learn Top Skills with Skilltori",
        type: "image/webp",
      },
    ],
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
  verification: {
    google: "Qm4GMTrrOVWmVFuRd_bgJjs0fRBBvzv6GwaI5aJrpV8",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "education",
  classification: "education",
  other: {
    "geo.region": "CA",
    "geo.placename": "Canada",
    "geo.position": "43.6532;-79.3832",
    "ICBM": "43.6532, -79.3832",
    "DC.title": "Skilltori - Learn Top Skills with Skilltori",
    "DC.creator": "Skilltori",
    "DC.subject": "Education",
    "DC.description": "Learn top skills from industry experts with Skilltori. Our courses are designed to help you gain the skills you need to succeed in your career.",
    "DC.publisher": "Skilltori",
    "DC.contributor": "Skilltori",
    "DC.date": "2024-12-01",
    "DC.type": "Text",
    "DC.format": "text/html",
    "DC.identifier": "https://skilltori.com",
    "DC.language": "en",
    "DC.coverage": "Canada",
    "DC.rights": "Copyright © 2025 Skilltori. All rights reserved.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
  },
  manifest: "/site.webmanifest",
  applicationName: "Skilltori",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-PCF0FZZ4HS"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PCF0FZZ4HS');
        `}
      </Script>

      {/* Google Tag Manager */}
      <Script id="gtm-head" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KVH8WPLR');
        `}
      </Script>

      {/* Google Ads */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17090157974"
        strategy="afterInteractive"
      />
      <Script id="gtag-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17090157974');
        `}
      </Script>

      {/* Google Sign In */}
      <Script src="https://accounts.google.com/gsi/client" async defer></Script>

      {/* Meta Pixel Code */}
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1327822238919663');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* Schema.org */}
      <Script id="schema-org" type="application/ld+json" strategy="afterInteractive">
      {`{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Skilltori",
        "alternateName": "Skilltori",
        "url": "https://skilltori.com/"
      }`}
      </Script>

      <body className={`${hindSiliguri.variable} ${geistMono.variable} antialiased`}>
        {/* Meta Pixel (noscript) */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1327822238919663&ev=PageView&noscript=1" alt="" />
        </noscript>
        <Providers>
          <Toaster position="top-center" />
          {/* Google Tag Manager (noscript) */}
          <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KVH8WPLR" height="0" width="0" style={{display: 'none', visibility: 'hidden'}}></iframe></noscript>
          {children}
          {/* WhatsApp Button */}
          <WhatsAppButton />
        </Providers>
      </body>

      {/* Umami Analytics */}
      <Script 
        defer 
        src="https://cloud.umami.is/script.js" 
        data-website-id="e7217454-4abd-4503-9c59-941cac2404ec"
      />
    </html>
  );
}
