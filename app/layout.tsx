import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Rowva",
  description: "Gmail ↔ Notion with enrichment",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Ensure proper mobile scaling and support for iOS safe-area
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
} as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
