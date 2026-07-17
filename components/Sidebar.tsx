"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface SidebarProps { session?: Session | null; isOpen?: boolean; onClose?: () => void; }
type IconName = "dashboard" | "report" | "players" | "coaches" | "sessions" | "trophy" | "manage" | "calendar" | "settings";

const iconPaths: Record<IconName, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    report: <><path d="M6 3h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
    players: <><circle cx="9" cy="8" r="4" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a4 4 0 0 1 0 8M18 15a5 5 0 0 1 3 4.6V21" /></>,
    coaches: <><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2M8 14l4 3 4-3" /></>,
    sessions: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h3M8 18h6" /></>,
    trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6" /></>,
    manage: <><circle cx="12" cy="12" r="3" /><path d="M19 15a2 2 0 0 0 .4 2l-2.4 2.4a2 2 0 0 0-2-.4l-1 .4-.7 1.6h-3l-.7-1.6-1-.4a2 2 0 0 0-2 .4L4.2 17a2 2 0 0 0 .4-2l-.4-1-1.7-.7v-3l1.7-.7.4-1a2 2 0 0 0-.4-2L6.6 4.2a2 2 0 0 0 2 .4l1-.4.7-1.7h3l.7 1.7 1 .4a2 2 0 0 0 2-.4l2.4 2.4a2 2 0 0 0-.4 2l.4 1 1.6.7v3l-1.6.7-.4 1Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h.01M12 15h.01M16 15h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 15a2 2 0 0 0 .4 2l-2.4 2.4a2 2 0 0 0-2-.4l-1 .4-.7 1.6h-3l-.7-1.6-1-.4a2 2 0 0 0-2 .4L4.2 17a2 2 0 0 0 .4-2l-.4-1-1.7-.7v-3l1.7-.7.4-1a2 2 0 0 0-.4-2L6.6 4.2a2 2 0 0 0 2 .4l1-.4.7-1.7h3l.7 1.7 1 .4a2 2 0 0 0 2-.4l2.4 2.4a2 2 0 0 0-.4 2l.4 1 1.6.7v3l-1.6.7-.4 1Z" /></>,
};

function NavIcon({ name }: { name: IconName }) {
    return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

const navItems = [
    { section: "Overview", links: [{ href: "/dashboard", label: "Overview", icon: "dashboard" as IconName }, { href: "/reports", label: "Reports", icon: "report" as IconName }] },
    { section: "Team", links: [{ href: "/players", label: "Players", icon: "players" as IconName }, { href: "/coaches", label: "Coaches", icon: "coaches" as IconName }] },
    { section: "Operations", links: [{ href: "/sessions", label: "Training", icon: "sessions" as IconName }, { href: "/competitions", label: "Competitions", icon: "trophy" as IconName }] },
];
const adminItems = [{ section: "Manage", links: [
    { href: "/admin", label: "Admin Center", icon: "manage" as IconName },
    { href: "/admin/profile", label: "My Profile", icon: "coaches" as IconName },
    { href: "/admin/semesters", label: "School Years", icon: "calendar" as IconName },
    { href: "/admin/players", label: "Manage Players", icon: "players" as IconName },
    { href: "/admin/coaches", label: "Manage Coaches", icon: "coaches" as IconName },
    { href: "/admin/settings", label: "Team Settings", icon: "settings" as IconName },
] }];

export default function Sidebar({ session: propSession, isOpen, onClose }: SidebarProps) {
    const { data: clientSession } = useSession();
    const session = clientSession || propSession;
    const pathname = usePathname();
    const isAdmin = session?.user?.role === "ADMIN";
    const allSections = isAdmin ? [...navItems, ...adminItems] : navItems;
    const initials = session?.user?.name ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "G";

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-logo"><div className="brand-lockup">
                <Image src="/ATKD.jpg" alt="Ateneo Taekwondo Team" width={44} height={44} className="brand-mark" priority />
                <div><div className="sidebar-logo-title">ADMU Taekwondo</div><div className="sidebar-logo-subtitle">Performance hub</div></div>
                <button className="mobile-only sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
            </div></div>
            <nav className="sidebar-nav" aria-label="Main navigation">
                {allSections.map((section) => <div className="sidebar-section" key={section.section}>
                    <div className="sidebar-section-label">{section.section}</div>
                    {section.links.map((link) => {
                        const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                        return <Link key={link.href} href={link.href} onClick={onClose} className={`sidebar-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><NavIcon name={link.icon} /><span>{link.label}</span></Link>;
                    })}
                </div>)}
            </nav>
            <div className="sidebar-footer">
                <Link href={isAdmin ? "/admin/profile" : "/dashboard"} className="sidebar-user" onClick={onClose}><div className="sidebar-avatar">{session?.user?.profileImageUrl ? <Image src={session.user.profileImageUrl} alt="" fill sizes="38px" unoptimized /> : initials}</div><div className="sidebar-user-copy"><div className="sidebar-user-name">{session?.user?.name || "Guest Visitor"}</div><div className="sidebar-user-role">{isAdmin ? "View my profile" : "View only"}</div></div></Link>
                <button className="btn btn-ghost btn-sm sidebar-signout" onClick={() => { if (session) signOut({ callbackUrl: "/login" }); else { document.cookie = "guest_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; window.location.href = "/login"; } }}>Sign out</button>
            </div>
        </aside>
    );
}
