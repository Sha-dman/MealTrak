import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ClerkProvider } from "@clerk/nextjs";
import ReactQueryClientProvider from "@/components/react-query-client-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MealTrak",
  description: "Plan your meals with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-gray-50 to-white text-black`}
        >
          <ReactQueryClientProvider>
            <NavBar />
            <main className="min-h-screen pt-16 px-6 sm:px-10">
              {children}
            </main>
          </ReactQueryClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
