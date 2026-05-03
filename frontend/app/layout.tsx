import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Lexend, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arc.anabaslabs.com"),
  title: "ARC",
  description: "Augmented Retrieval Chatbot",
  robots: "index, follow",
  creator: "Anabas Labs",
  authors: [
    { name: "Anabas Labs", url: "https://anabaslabs.com" },
    { name: "Saptarshi Roy", url: "https://hirishi.in" },
    { name: "Krishnendu Das", url: "https://itskdhere.com" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "https://arc.anabaslabs.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        lexend.variable,
        jetbrainsMono.variable,
        "font-mono",
        "h-full",
        "antialiased"
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
