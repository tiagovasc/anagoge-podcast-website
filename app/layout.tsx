import type React from "react"
// import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Anagoge Podcast",
  description: "A Philosophy and Psychology Podcast.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=20261102" sizes="any" />
        <meta name="twitter:title" content="Anagoge Podcast" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="Anagoge Podcast" />
        <meta name="twitter:creator" content="Anagoge Podcast" />
        <meta property="og:site_name" content="Anagoge Podcast" />
        <meta name="og:title" content="Anagoge Podcast" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/card.png" />
      </head>
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange> */}
          {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
