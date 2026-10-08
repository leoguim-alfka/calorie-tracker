import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Calorie Tracker',
  description: 'Track food, calories, exercise, weight and progress.',
  applicationName: 'Calorie Tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Calorie Tracker',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}