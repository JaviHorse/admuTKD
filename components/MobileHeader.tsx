"use client";

import Image from "next/image";

export default function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="mobile-header mobile-only">
            <div className="mobile-brand">
                <Image src="/ATKD.jpg" alt="Ateneo Taekwondo Team" width={36} height={36} className="brand-mark" />
                <div><span className="sidebar-logo-title">ADMU TKD</span><small>Team command center</small></div>
            </div>
            <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
        </header>
    );
}
