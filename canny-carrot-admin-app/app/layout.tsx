import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canny Carrot Admin Console",
  description: "Admin console for managing Canny Carrot businesses and customers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

