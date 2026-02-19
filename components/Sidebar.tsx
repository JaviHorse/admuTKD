"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import GlobalSearch from "./GlobalSearch";

interface SidebarProps {
    session?: Session | null;
    isOpen?: boolean;
    onClose?: () => void;
}

const navItems = [
    {
        section: "Overview",
        links: [
            { href: "/dashboard", label: "Dashboard", icon: "📊" },
            { href: "/reports", label: "Reports", icon: "📋" },
        ],
    },
    {
        section: "Team",
        links: [
            { href: "/players", label: "Players", icon: "🥋" },
            { href: "/coaches", label: "Coaches", icon: "👨‍🏫" },
        ],
    },
    {
        section: "Activity",
        links: [
            { href: "/sessions", label: "Sessions", icon: "📅" },
            { href: "/competitions", label: "Competitions", icon: "🏆" },
        ],
    },
];

const adminItems = [
    {
        section: "Admin",
        links: [
            { href: "/admin", label: "Admin Panel", icon: "⚙️" },
            { href: "/admin/semesters", label: "School Years", icon: "🗓️" },
            { href: "/admin/players", label: "Manage Players", icon: "✏️" },
            { href: "/admin/coaches", label: "Manage Coaches", icon: "✏️" },
            { href: "/admin/sessions/new", label: "New Session", icon: "➕" },
            { href: "/admin/competitions/new", label: "New Competition", icon: "➕" },
        ],
    },
];

export default function Sidebar({ session: propSession, isOpen, onClose }: SidebarProps) {
    const { data: clientSession } = useSession();
    const session = clientSession || propSession;
    const pathname = usePathname();
    const isAdmin = session?.user?.role === "ADMIN";
    const allSections = isAdmin ? [...navItems, ...adminItems] : navItems;

    const initials = session?.user?.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "G";

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-logo">
                <div className="flex-between">
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🥋</div>
                    <button
                        className="mobile-only hamburger"
                        onClick={onClose}
                        style={{ padding: 4, margin: -4 }}
                    >
                        ✕
                    </button>
                </div>
                <div className="sidebar-logo-title">ADMU TKD</div>
                <div className="sidebar-logo-subtitle">Team Management</div>
            </div>

            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--sidebar-border)" }}>
                <GlobalSearch onResultClick={onClose} />
            </div>

            <nav className="sidebar-nav">
                {allSections.map((section) => (
                    <div key={section.section}>
                        <div className="sidebar-section-label">{section.section}</div>
                        {section.links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`sidebar-link ${pathname === link.href ||
                                    (link.href !== "/admin" && pathname.startsWith(link.href) && link.href !== "/")
                                    ? "active"
                                    : ""
                                    }`}
                            >
                                <span style={{ fontSize: 15 }}>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar" style={!session ? { background: "var(--accent-gold)" } : {}}>{initials}</div>
                    <div>
                        <div className="sidebar-user-name">{session?.user?.name || "Guest Visitor"}</div>
                        <div className="sidebar-user-role">{session?.user?.role || "View Only"}</div>
                    </div>
                </div>
                {session ? (
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        Sign Out
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className="btn btn-primary btn-sm"
                        style={{ width: "100%", justifyContent: "center" }}
                    >
                        Sign In / Admin
                    </Link>
                )}
            </div>
        </aside>
    );
}
