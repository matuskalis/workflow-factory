import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://workflow-factory.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Workflow Factory - GitHub Actions Recipes',
    template: '%s | Workflow Factory',
  },
  description:
    'Generate correct, minimal GitHub Actions workflows from typed building blocks. Deploy Next.js, Docker, static sites, and more.',
  openGraph: {
    title: 'Workflow Factory - GitHub Actions Recipes',
    description:
      'Generate correct, minimal GitHub Actions workflows from typed building blocks.',
    url: SITE_URL,
    siteName: 'Workflow Factory',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workflow Factory - GitHub Actions Recipes',
    description:
      'Generate correct, minimal GitHub Actions workflows from typed building blocks.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Plausible Analytics - replace workflow-factory.dev with your domain */}
        <Script
          defer
          data-domain="workflow-factory.dev"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-5xl mx-auto px-4 py-4">
              <a href="/" className="text-xl font-semibold">
                Workflow Factory
              </a>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
            <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
              GitHub Actions workflow generator
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
