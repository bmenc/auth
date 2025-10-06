import type { Metadata } from "next";
import "./globals.css";
import {Providers} from './providers';

export const metadata: Metadata = {
  title: "Blueprint App",
  description: "A simple authentication app built with Next.js and Blueprint.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
