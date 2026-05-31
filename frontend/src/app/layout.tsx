import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Agentic Liquidity Router",
  description:
    "Autonomous AI agent for cross-border payment routing across African mobile money rails and onchain liquidity.",
  openGraph: {
    title: "Agentic Liquidity Router",
    description:
      "AI-powered cross-border payments. Optimal routing across MTN, Orange, M-Pesa, and onchain pools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-background text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
