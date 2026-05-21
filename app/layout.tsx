import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { isStaticPagesDeploy } from '@/lib/static-pages'
import { BRAND_LOGO_SRC } from '@/lib/brand-assets'
import './globals.css'
import { ConditionalExpertChatWidget } from '@/components/conditional-expert-chat-widget'
import { LeadCaptureModal } from '@/components/lead-capture-modal'
import { Toaster } from '@/components/ui/toaster'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_STATIC_PAGES === '1'
      ? 'https://growpal-team.github.io/GrowPal'
      : 'http://localhost:3000',
  ),
  title: 'GrowPal - Rooted in Home, Growing for Palestine',
  description: 'GrowPal is a smart green marketplace that helps users transform any space into a sustainable green environment.',
  icons: {
    icon: BRAND_LOGO_SRC,
    apple: BRAND_LOGO_SRC,
  },
}

export const viewport: Viewport = {
  themeColor: '#3a7d44',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <LeadCaptureModal />
        <ConditionalExpertChatWidget />
        <Toaster />
        {!isStaticPagesDeploy ? <Analytics /> : null}
      </body>
    </html>
  )
}
