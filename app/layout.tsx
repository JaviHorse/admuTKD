import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "ADMU TKD — Performance Hub",
  description: "Ateneo de Manila University Taekwondo Team Management System",
  icons: {
    icon: "/LOGO.jpg",
    apple: "/LOGO.jpg",
  },
=======
<<<<<<< Updated upstream
  title: "ADMU TKD — Team Management",
  description: "Ateneo de Manila University Taekwondo Team Management System",
=======
  title: "ADMU TKD: Performance Hub",
  description: "Ateneo de Manila University Taekwondo Team Management System",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
>>>>>>> Stashed changes
>>>>>>> c14197c (Finalized layout sana)
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
