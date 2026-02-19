"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import MobileHeader from "./MobileHeader";
import Sidebar from "./Sidebar";
import type { Session } from "next-auth";

interface LayoutWrapperProps {
    children: React.ReactNode;
    session: Session | null;
}

export default function LayoutWrapper({ children, session: propSession }: LayoutWrapperProps) {
    const { data: clientSession } = useSession();
    const session = clientSession || propSession;
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when pathname changes
    useEffect(() => {
        if (isSidebarOpen) {
            const timeout = setTimeout(() => setIsSidebarOpen(false), 0);
            return () => clearTimeout(timeout);
        }
    }, [pathname, isSidebarOpen]);

    // Hide sidebar and app-layout on login page
    if (pathname === "/login") {
        return <>{children}</>;
    }

    return (
        <div className="flex-column" style={{ minHeight: "100vh" }}>
            <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="app-layout">
                <div
                    className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
                <Sidebar
                    session={session}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}
