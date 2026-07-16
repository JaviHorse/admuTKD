"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import GlobalSearch from "./GlobalSearch";

const pageNames: Record<string, string> = {
    dashboard: "Overview",
    reports: "Reports",
    players: "Players",
    coaches: "Coaches",
    sessions: "Training",
    competitions: "Competitions",
    admin: "Management",
};

const primaryActions: Record<string, { label: string; href: string }> = {
    players: { label: "Add player", href: "/admin/players" },
    coaches: { label: "Manage coaches", href: "/admin/coaches" },
    sessions: { label: "Create session", href: "/admin/sessions/new" },
    competitions: { label: "Add competition", href: "/admin/competitions/new" },
};

export default function AppTopbar({ session }: { session: Session | null }) {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);
    const root = segments[0] || "dashboard";
    const title = pageNames[root] || "Team Hub";
    const action = primaryActions[root];
    const isAdmin = session?.user?.role === "ADMIN";
    const initials = (session?.user?.name || "Guest Visitor")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="app-topbar">
            <div className="topbar-breadcrumb">
                <span>ADMU Taekwondo</span>
                <b>/</b>
                <strong>{title}</strong>
            </div>
            <div className="topbar-tools">
                <div className="topbar-search"><GlobalSearch /></div>
                {isAdmin && action ? (
                    <Link href={action.href} className="btn btn-primary topbar-action">
                        <span aria-hidden="true">+</span>{action.label}
                    </Link>
                ) : !isAdmin ? (
                    <span className="badge badge-view-only">View-only access</span>
                ) : null}
                <button className="topbar-icon" aria-label="Notifications">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
                </button>
                <div className="topbar-avatar" title={session?.user?.name || "Guest Visitor"}>{initials}</div>
            </div>
        </header>
    );
}
