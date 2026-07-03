import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Expert AC Repair & Service | Fast & Reliable AC Technicians',
  description: 'Professional AC repair, installation, maintenance, and gas filling services. Same-day service by experienced technicians. Book now for doorstep AC service.',
  keywords: 'AC repair near me, AC service near me, AC technician, AC gas filling service, AC installation service, air conditioning repair, split AC repair, window AC service',
  authors: [{ name: 'AC Repair Service' }],
  openGraph: {
    title: 'Expert AC Repair & Service at Your Doorstep',
    description: 'Fast, reliable, and affordable AC repair, installation, and maintenance services.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://CoolAir.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        {/* Schema.org LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HVACBusiness",
              "name": "Expert AC Repair & Service",
              "description": "Professional AC repair, installation, and maintenance services",
              "url": "https://your-domain.com",
              "telephone": "+91-9389982912",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Your City",
                "addressRegion": "Your State",
                "addressCountry": "IN"
              },
              "openingHours": "Mo-Su 08:00-22:00",
              "priceRange": "$$",
              "serviceType": ["AC Repair", "AC Installation", "AC Maintenance", "AC Gas Filling"]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}