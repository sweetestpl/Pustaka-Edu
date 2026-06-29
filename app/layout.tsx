import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PustakaEdu - Sistem Manajemen Perpustakaan Digital Sekolah",
  description: "Sistem Manajemen Perpustakaan Digital Sekolah Interaktif dan Terpadu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
