import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Press_Start_2P } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { LayoutClient } from '@/components/layout-client'
import './globals.css'

const pressStart = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-press-start' })

export const metadata: Metadata = {
  title: 'PlaneBlock',
  description: '经典纸笔飞机大战的数字版本',
  generator: 'v0.app',
  icons: { icon: '/planeBlock.png' },
}

export const viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${pressStart.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <LayoutClient>{children}</LayoutClient>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
