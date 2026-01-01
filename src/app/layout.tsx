import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern Portfolio Tracker",
  description: "Track your global investments in style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  var theme = storedTheme || systemTheme;
                  
                  if (theme === 'light') {
                    document.body.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <main className="container" style={{ paddingTop: '6rem' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
