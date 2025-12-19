import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keeper",
  description: "Calendar management and synchronization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="root">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
