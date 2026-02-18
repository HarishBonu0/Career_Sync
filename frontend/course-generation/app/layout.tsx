import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/providers/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Career Sync - Course Generation',
  description: 'AI-powered learning journeys and courses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Auto-detect environment and set module URLs */}
        <script dangerouslySetInnerHTML={{__html: `
          window.getModuleUrls = function() {
            const isProduction = window.location.hostname.includes('onrender.com');
            if (isProduction) {
              return {
                landing: 'https://careersync-landing-oldo.onrender.com',
                course: 'https://careersync-course-gen-oldo.onrender.com',
                roadmap: 'https://careersync-roadmap-oldo.onrender.com',
                skillEval: 'https://career-sync-skill-evalutor.onrender.com',
                backend: 'https://careersync-backend-oldo.onrender.com'
              };
            }
            return {
              landing: 'http://localhost:4173',
              course: 'http://localhost:3002',
              roadmap: 'http://localhost:5173',
              skillEval: 'http://localhost:3001',
              backend: 'http://localhost:5000'
            };
          };
        `}} />
        {/* Load profile utilities for database integration */}
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            var script = document.createElement('script');
            script.src = window.getModuleUrls().landing + '/profile-utils.js';
            script.defer = true;
            document.head.appendChild(script);
          })();
        `}} />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
