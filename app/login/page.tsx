"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
            <Image className="login-bg" src="/background.png" alt="" fill sizes="100vw" priority />
            <div className="login-overlay" />

            <div className="login-shell">
                <section className="login-hero" aria-label="Platform overview">
                    <div className="hero-badge">Athletic performance platform</div>
                    <h1 className="hero-title">ADMU TKD</h1>
                    <p className="hero-subtitle">Team Analytics and Management System</p>
                    <div className="hero-line" />
                    <p className="hero-copy">
                        Manage training sessions, track attendance, and keep your team aligned with a modern command center built for Taekwondo operations.
                    </p>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-number">24/7</span>
                            <span className="hero-stat-label">attendance insights</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat-number">Live</span>
                            <span className="hero-stat-label">session visibility</span>
                        </div>
                    </div>
                </section>

                <div className="login-card">
                    <div className="login-logo">
                        <Image className="login-logo-img" src="/ATKD.jpg" alt="ATKD Logo" width={64} height={64} priority />
                        <div className="login-logo-title">Secure Admin Access</div>
                        <div className="login-logo-sub">Sign in to your dashboard</div>
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
                            disabled={loading}
                        >
                            {loading ? "Signing in…" : "Sign In"}
                        </button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <button
                            type="button"
                            className="guest-btn"
                            onClick={() => {
                                document.cookie = "guest_access=true; path=/; max-age=86400";
                                router.push("/dashboard");
                            }}
                        >
                            View as Player/Coach
                        </button>
                    </form>

                    <div className="login-footnote">
                        <div className="footnote-title">Only admins can log in</div>
                        <div>Admins: <span>Team Captains</span></div>
                        <div>How to view: <span>Click Guest button</span></div>
                    </div>
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
                    background: #04060b;
                    padding: 24px;
                }

                .login-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    transform: scale(1.02);
                    filter: contrast(1.05) saturate(1.08);
                    opacity: 0.95;
                    z-index: 0;
                }

                .login-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(120deg, rgba(4, 7, 14, 0.92), rgba(6, 10, 24, 0.72)),
                        radial-gradient(circle at top left, rgba(47, 125, 255, 0.18), transparent 30%);
                    z-index: 1;
                }

                .login-shell {
                    position: relative;
                    z-index: 2;
                    width: min(1180px, 100%);
                    display: grid;
                    grid-template-columns: 1.05fr 0.95fr;
                    gap: 24px;
                    align-items: center;
                }

                .login-hero {
                    padding: 36px;
                    border-radius: 28px;
                    background: rgba(5, 10, 22, 0.48);
                    border: 1px solid rgba(255, 255, 255, 0.10);
                    backdrop-filter: blur(16px);
                    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: rgba(47, 125, 255, 0.16);
                    border: 1px solid rgba(102, 163, 255, 0.25);
                    color: #b9d7ff;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                }

                .hero-title {
                    font-size: clamp(2.4rem, 4vw, 3.4rem);
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: #f5f8ff;
                    line-height: 0.95;
                    margin-bottom: 10px;
                    text-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
                }

                .hero-subtitle {
                    font-size: 1.05rem;
                    color: #dce8ff;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .hero-line {
                    width: 88px;
                    height: 3px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, #2f7dff, #f5a623);
                    margin-bottom: 16px;
                }

                .hero-copy {
                    max-width: 560px;
                    color: rgba(255, 255, 255, 0.78);
                    font-size: 0.98rem;
                    margin-bottom: 22px;
                }

                .hero-stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .hero-stat {
                    flex: 1;
                    min-width: 140px;
                    padding: 14px 16px;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .hero-stat-number {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #ffffff;
                }

                .hero-stat-label {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.65);
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                }

                .login-card {
                    position: relative;
                    z-index: 2;
                    padding: 28px;
                    border-radius: 24px;
                    background:
                        radial-gradient(circle at 20% 10%, rgba(88, 101, 242, 0.18), transparent 50%),
                        radial-gradient(circle at 80% 90%, rgba(168, 85, 247, 0.16), transparent 55%),
                        linear-gradient(145deg, rgba(12, 18, 34, 0.98), rgba(8, 12, 26, 0.95));
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 22px 60px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.04);
                }

                .login-logo {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .login-logo-img {
                    width: 64px;
                    height: 64px;
                    object-fit: contain;
                    margin-bottom: 10px;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .login-logo-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #f8fbff;
                    margin-bottom: 4px;
                }

                .login-logo-sub {
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.68);
                }

                .login-error {
                    padding: 10px 12px;
                    border-radius: 10px;
                    margin-bottom: 12px;
                    background: rgba(239, 68, 68, 0.14);
                    border: 1px solid rgba(239, 68, 68, 0.28);
                    color: #fecaca;
                    font-size: 0.9rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    margin-bottom: 12px;
                }

                .form-label {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.72);
                    text-transform: uppercase;
                    letter-spacing: 0.14em;
                }

                .form-input {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.11);
                    background: rgba(255, 255, 255, 0.04);
                    color: #f8fbff;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.35);
                }

                .form-input:focus {
                    border-color: rgba(47, 125, 255, 0.7);
                    box-shadow: 0 0 0 3px rgba(47, 125, 255, 0.16);
                }

                .btn.btn-primary {
                    width: 100%;
                    justify-content: center;
                    margin-top: 8px;
                    padding: 12px;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #2f7dff 0%, #66a3ff 100%);
                    color: #fff;
                    font-weight: 700;
                    box-shadow: 0 12px 28px rgba(47, 125, 255, 0.24);
                }

                .divider {
                    margin: 18px 0;
                    text-align: center;
                    position: relative;
                }

                .divider::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.10);
                }

                .divider span {
                    position: relative;
                    padding: 0 12px;
                    background: rgba(8, 12, 26, 0.95);
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.55);
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                }

                .guest-btn {
                    width: 100%;
                    justify-content: center;
                    padding: 12px;
                    border-radius: 12px;
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

                .login-footnote {
                    margin-top: 20px;
                    padding: 14px 16px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .footnote-title {
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 6px;
                }

                .login-footnote span {
                    color: #ffd27a;
                }

                @media (max-width: 860px) {
                    .login-shell {
                        grid-template-columns: 1fr;
                    }

                    .login-hero {
                        padding: 24px;
                    }
                }
            `}</style>
        </div>
    );
}
                    padding: 36px;
                    border-radius: 28px;
                    background: rgba(5, 10, 22, 0.48);
                    border: 1px solid rgba(255, 255, 255, 0.10);
                    backdrop-filter: blur(16px);
                    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: rgba(47, 125, 255, 0.16);
                    border: 1px solid rgba(102, 163, 255, 0.25);
                    color: #b9d7ff;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                }

                .hero-title {
                    font-size: clamp(2.4rem, 4vw, 3.4rem);
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: #f5f8ff;
                    line-height: 0.95;
                    margin-bottom: 10px;
                    text-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
                }

                .hero-subtitle {
                    font-size: 1.05rem;
                    color: #dce8ff;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .hero-line {
                    width: 88px;
                    height: 3px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, #2f7dff, #f5a623);
                    margin-bottom: 16px;
                }

                .hero-copy {
                    max-width: 560px;
                    color: rgba(255, 255, 255, 0.78);
                    font-size: 0.98rem;
                    margin-bottom: 22px;
                }

                .hero-stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .hero-stat {
                    flex: 1;
                    min-width: 140px;
                    padding: 14px 16px;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .hero-stat-number {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #ffffff;
                }

                .hero-stat-label {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.65);
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                }

                .login-card {
                    position: relative;
                    z-index: 2;
                    padding: 28px;
                    border-radius: 24px;
                    background:
                        radial-gradient(circle at 20% 10%, rgba(88, 101, 242, 0.18), transparent 50%),
                        radial-gradient(circle at 80% 90%, rgba(168, 85, 247, 0.16), transparent 55%),
                        linear-gradient(145deg, rgba(12, 18, 34, 0.98), rgba(8, 12, 26, 0.95));
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 22px 60px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.04);
>>>>>>> c14197c (Finalized layout sana)
                }

                .login-logo {
                    text-align: center;
<<<<<<< HEAD
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
=======
                    margin-bottom: 20px;
                }

                .login-logo-img {
                    width: 64px;
                    height: 64px;
                    object-fit: contain;
                    margin-bottom: 10px;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .login-logo-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #f8fbff;
                    margin-bottom: 4px;
                }

                .login-logo-sub {
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.68);
                }

                .login-error {
                    padding: 10px 12px;
                    border-radius: 10px;
                    margin-bottom: 12px;
                    background: rgba(239, 68, 68, 0.14);
                    border: 1px solid rgba(239, 68, 68, 0.28);
                    color: #fecaca;
                    font-size: 0.9rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    margin-bottom: 12px;
                }

                .form-label {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.72);
                    text-transform: uppercase;
                    letter-spacing: 0.14em;
                }

                .form-input {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.11);
                    background: rgba(255, 255, 255, 0.04);
                    color: #f8fbff;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.35);
                }

                .form-input:focus {
                    border-color: rgba(47, 125, 255, 0.7);
                    box-shadow: 0 0 0 3px rgba(47, 125, 255, 0.16);
                }

                .btn.btn-primary {
                    width: 100%;
                    justify-content: center;
                    margin-top: 8px;
                    padding: 12px;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #2f7dff 0%, #66a3ff 100%);
                    color: #fff;
                    font-weight: 700;
                    box-shadow: 0 12px 28px rgba(47, 125, 255, 0.24);
                }

                .divider {
                    margin: 18px 0;
                    text-align: center;
                    position: relative;
                }

                .divider::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.10);
                }

                .divider span {
                    position: relative;
                    padding: 0 12px;
                    background: rgba(8, 12, 26, 0.95);
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.55);
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                }

                .guest-btn {
                    width: 100%;
                    justify-content: center;
                    padding: 12px;
                    border-radius: 12px;
>>>>>>> c14197c (Finalized layout sana)
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
<<<<<<< HEAD
                    animation: guestGlow 2.4s ease-in-out infinite alternate;
=======
>>>>>>> c14197c (Finalized layout sana)
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

<<<<<<< HEAD
                @keyframes guestGlow {
                    from {
                        box-shadow: 0 0 6px rgba(0, 180, 255, 0.25), 0 0 12px rgba(0, 180, 255, 0.15), inset 0 0 4px rgba(255, 255, 255, 0.08);
                    }
                    to {
                        box-shadow: 0 0 14px rgba(0, 180, 255, 0.55), 0 0 26px rgba(0, 180, 255, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.18);
                    }
                }
            `}</style>
=======
                .login-footnote {
                    margin-top: 20px;
                    padding: 14px 16px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .footnote-title {
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 6px;
                }

                .login-footnote span {
                    color: #ffd27a;
                }

                @media (max-width: 860px) {
                    .login-shell {
                        grid-template-columns: 1fr;
                    }

                    .login-hero {
                        padding: 24px;
                    }
                }
            `}</style>
>>>>>>> Stashed changes
>>>>>>> c14197c (Finalized layout sana)
        </div>
    );
}
