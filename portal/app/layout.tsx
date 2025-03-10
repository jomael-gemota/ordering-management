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
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Ordering Management</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900`}
      >
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 text-white p-4 hidden md:block">
            <h2 className="text-xl font-bold">Sidebar</h2>
            <ul className="mt-4 space-y-2">
              <li><a href="/invoice-audit-records" className="block p-2 rounded hover:bg-gray-700">Invoice Audit Records</a></li>
              {/* <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Reports</a></li>
              <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Settings</a></li> */}
            </ul>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow p-4 h-16 flex justify-between items-center">
              {/* <h1 className="text-lg font-semibold">Invoice Audit Records</h1> */}
              <button className="md:hidden p-2 bg-gray-800 text-white rounded">Menu</button>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}