import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "T&P Cell - GNDEC Placement Drive Manager",
  description: "Official Training & Placement Drive Management Portal for Guru Nanak Dev Engineering College (GNDEC), Ludhiana",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Brand Logo & College Title */}
              <Link href="/" className="flex items-center gap-3 group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">T&P Portal</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    Guru Nanak Dev Engineering College
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Drives</span>
                </Link>

                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Post Drive</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-700">
              Training & Placement Cell • Guru Nanak Dev Engineering College (GNDEC)
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Gill Park, Gill Road, Ludhiana, Punjab 141006 • Placement Drive Management System
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
