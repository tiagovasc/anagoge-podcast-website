import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata, Viewport } from "next"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })

const description = "A Philosophy and Psychology Podcast."

export const metadata: Metadata = {
  metadataBase: new URL("https://anagogepodcast.com"),
  title: { default: "Anagoge Podcast", template: "%s | Anagoge Podcast" },
  description,
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.ico?v=20261102-approved", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: "Anagoge Podcast",
    title: "Anagoge Podcast",
    description,
    type: "website",
    url: "/",
    images: [{ url: "/card.png", width: 1200, height: 630, alt: "Anagoge Podcast" }],
  },
  twitter: { card: "summary_large_image", title: "Anagoge Podcast", description, images: ["/card.png"] },
}

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
