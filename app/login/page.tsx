"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password.");
            setLoading(false);
        } else {
            const res = await fetch("/api/auth/session");
            const session = await res.json();
            if (session?.user?.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        }
    }

    return (
        <div className="login-page">
            <img className="login-bg" src="/background.png" alt="" />
            <div className="login-overlay" />

            <div className="login-card">
                <div className="login-logo">
                    <img className="login-logo-img" src="/ATKD.jpg" alt="ATKD Logo" />
                    <div className="login-logo-title">ADMU TKD</div>
                    <div className="login-logo-sub">Team Analytics and Management System</div>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@admutkd.com"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "12px" }}
                        disabled={loading}
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>

                    <div style={{ margin: "16px 0", textAlign: "center", position: "relative" }}>
                        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.08)" }}></div>
                        <span style={{ position: "relative", padding: "0 12px", background: "var(--bg-secondary)", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>OR</span>
                    </div>

                    <button
                        type="button"
                        className="guest-btn"
                        style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                        onClick={() => {
                            document.cookie = "guest_access=true; path=/; max-age=86400";
                            router.push("/dashboard");
                        }}
                    >
                        View as Player/Coach
                    </button>
                </form>

                <div style={{ marginTop: 24, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>Only Admins can login</div>
                    <div>Admins: <span style={{ color: "var(--accent-gold)" }}>Captains + Boss Cams </span> </div>
                    <div style={{ marginTop: 4 }}>How to view: <span style={{ color: "var(--info)" }}>Click Guest button yall</span> </div>
                </div>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: #05070b;
                }

                .login-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    transform: scale(1.02);
                    filter: contrast(1.05) saturate(1.05);
                    opacity: 0.95;
                    z-index: 0;
                }

                .login-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.28));
                    z-index: 1;
                }

                .login-card {
                    position: relative;
                    z-index: 2;
                    background:
                        radial-gradient(circle at 20% 10%, rgba(88, 101, 242, 0.18), transparent 55%),
                        radial-gradient(circle at 80% 90%, rgba(168, 85, 247, 0.15), transparent 60%),
                        linear-gradient(
                            145deg,
                            rgba(12, 18, 34, 0.98),
                            rgba(8, 12, 26, 0.95)
                        );
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow:
                        0 20px 60px rgba(0, 0, 0, 0.65),
                        inset 0 1px 0 rgba(255, 255, 255, 0.04);
                    transform: scale(0.92);
    transform-origin: center;
                }

                .login-logo {
                    text-align: center;
                    margin-bottom: 16px;
                }

                .login-logo-img {
                    width: 56px;
                    height: 56px;
                    object-fit: contain;
                    margin-bottom: 8px;
                }

                .guest-btn {
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    background: linear-gradient(135deg, rgba(0, 180, 255, 0.25), rgba(0, 120, 255, 0.35));
                    backdrop-filter: blur(6px);
                    color: #e6f7ff;
                    font-weight: 600;
                    letter-spacing: 0.4px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 8px rgba(0, 180, 255, 0.35), 0 0 16px rgba(0, 180, 255, 0.25), inset 0 0 6px rgba(255, 255, 255, 0.15);
                    animation: guestGlow 2.4s ease-in-out infinite alternate;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .guest-btn::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at center, rgba(0, 180, 255, 0.45), transparent 70%);
                    opacity: 0.6;
                    filter: blur(12px);
                    z-index: -1;
                }

                .guest-btn:hover {
                    transform: translateY(-1px) scale(1.01);
                    box-shadow: 0 0 18px rgba(0, 180, 255, 0.7), 0 0 34px rgba(0, 180, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.25);
                }

                @keyframes guestGlow {
                    from {
                        box-shadow: 0 0 6px rgba(0, 180, 255, 0.25), 0 0 12px rgba(0, 180, 255, 0.15), inset 0 0 4px rgba(255, 255, 255, 0.08);
                    }
                    to {
                        box-shadow: 0 0 14px rgba(0, 180, 255, 0.55), 0 0 26px rgba(0, 180, 255, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.18);
                    }
                }
            `}</style>
        </div>
    );
}