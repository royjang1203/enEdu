import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Source_Serif_4 } from "next/font/google";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "enEdu - English Learning MVP",
  description: "Vocabulary and grammar learning MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={serif.className}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff,_#f5f7fb_45%,_#eef3ff)]">
          <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              enEdu
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link className="hover:text-foreground" href="/vocab">
                Vocabulary
              </Link>
              <Link className="hover:text-foreground" href="/grammar">
                Grammar
              </Link>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-5xl px-6 pb-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
