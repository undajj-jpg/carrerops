import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career-Ops Recruiter",
  description: "AI-powered candidate evaluation pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-6">
          <a href="/" className="text-lg font-bold tracking-tight text-white">
            Career-Ops <span className="text-cyan-400 text-sm font-normal">Recruiter</span>
          </a>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Dashboard</a>
            <a href="/roles" className="hover:text-white transition-colors">Positions</a>
            <a href="/candidates" className="hover:text-white transition-colors">Candidates</a>
            <a href="/upload" className="hover:text-white transition-colors">Upload CVs</a>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
