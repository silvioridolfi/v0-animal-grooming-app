import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { BottomNav } from "@/components/bottom-nav"
import { GlobalHeader } from "@/components/global-header"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Andrea Peluquería Canina",
  description: "Sistema de gestión para peluquería de mascotas",
  icons: {
    icon: "/favicon.svg",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E91E8C",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" sizes="32x32" />
      </head>
      <body className={`${dmSans.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <GlobalHeader />
          {children}
          <BottomNav />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}