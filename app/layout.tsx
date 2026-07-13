import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "ADMU TKD — Team Management",
  description: "Ateneo de Manila University Taekwondo Team Management System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <LayoutWrapper session={session}>
            {children}
          </LayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
