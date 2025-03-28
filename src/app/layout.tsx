import React from "react";
import type { Metadata, Viewport } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
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
  title: "headcraftai",
  description: "Your AI-powered visual content creation studio",
  icons: {
    icon: [
      { url: '/favicon/icon.svg' }
    ],
    apple: [
      { url: '/favicon/icon.svg' }
    ]
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#33B9F2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/icon.svg" />
        <link rel="apple-touch-icon" href="/favicon/icon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
