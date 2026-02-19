"use client";

import React from "react";

interface MobileHeaderProps {
    onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="mobile-header mobile-only">
            <div className="flex-center" style={{ gap: 12 }}>
                <span style={{ fontSize: 24 }}>🥋</span>
                <span className="sidebar-logo-title" style={{ fontSize: 16 }}>ADMU TKD</span>
            </div>
            <button
                className="hamburger"
                onClick={onMenuClick}
                aria-label="Open Menu"
            >
                <span>☰</span>
            </button>
        </header>
    );
};

export default MobileHeader;
