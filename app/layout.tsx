import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CubeWorld - Minecraft-like Game',
  description: 'A Minecraft-inspired voxel game built with Next.js and Cosmic CMS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  )
}