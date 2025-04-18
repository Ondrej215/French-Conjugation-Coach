import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import Image from 'next/image';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "French Conjugation Coach",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="topWrapper">
          <Link href="/">
          <Image 
              src="/images/homeIcon.png" 
              alt="France Flag" 
              width={60} 
              height={35}
              style={{ borderRadius: '5px' }}
              className="menuButton"
            />
          </Link>
          <Link href="/classes">
            <Image 
              src="/images/classesIcon.png" 
              alt="France Flag" 
              width={60} 
              height={35}
              style={{ borderRadius: '5px' }}
              className="menuButton"
            />
            </Link>
            <Image 
              src="/images/FranceFlag.jpeg" 
              alt="France Flag" 
              width={60} 
              height={35}
              style={{ borderRadius: '5px' }}
            />
            <Link href="/account">
            <Image 
              src="/images/accountIcon.png" 
              alt="France Flag" 
              width={60} 
              height={35}
              style={{ borderRadius: '5px' }}
              className="menuButton"
            />
            </Link>
            <Link href="/faq-about">
            <Image 
              src="/images/helpIcon.png" 
              alt="France Flag" 
              width={60} 
              height={35}
              style={{ borderRadius: '5px' }}
              className="menuButton"
            />
            </Link>
          </div>

          <main>{children}</main>
        <footer>
        <Link href="https://portfolio-website-amber-pi.vercel.app/" target="_blank">© {new Date().getFullYear()} Ondrej Vamos. All rights reserved.</Link>
        </footer>
      </body>
    </html>
  );
}
