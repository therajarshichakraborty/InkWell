import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Dock } from "@/components/dock";
import { Providers } from "@/components/providers";
import { getSession } from "@/lib/api.server";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <html
      lang='en'
      className={inter.variable}
      suppressHydrationWarning>
      <body className='font-sans'>
        <Providers>
          {children}
          <Dock username={session?.user.username ?? null} />
        </Providers>
      </body>
    </html>
  );
}
