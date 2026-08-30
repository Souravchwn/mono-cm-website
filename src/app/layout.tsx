import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import { FloatingControls } from "@/components/FloatingControls";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mono CM — The Production-Centric Construction Engine",
  description:
    "One source of truth for every dollar, drawing, material, and worker on your site.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // data-theme is set by the inline script below before first paint;
      // React's server-rendered markup never has it, so hydration would
      // otherwise warn about the mismatch it expects to see here.
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <FloatingControls />
      </body>
    </html>
  );
}
