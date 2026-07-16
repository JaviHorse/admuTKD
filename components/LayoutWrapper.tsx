"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import MobileHeader from "./MobileHeader";
import Sidebar from "./Sidebar";
import AppTopbar from "./AppTopbar";
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
                <div className="content-shell">
                    <AppTopbar session={session} />
                    <main className="main-content">{children}</main>
                </div>
            </div>
        </div>
    );
}
