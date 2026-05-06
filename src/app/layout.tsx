import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoMVP",
  description: "Radar automático de oportunidades B2C — Built2Go.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
