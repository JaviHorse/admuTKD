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
            // Fetch session to determine role
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
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">🥋</div>
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
                        className="btn btn-ghost"
                        style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                        onClick={() => router.push("/dashboard")}
                    >
                        View as Guest
                    </button>
                </form>

                <div style={{ marginTop: 24, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>Demo Accounts</div>
                    <div>Admins: <span style={{ color: "var(--accent-gold)" }}>Captains + Ate Cams + Sir E</span> </div>
                    <div style={{ marginTop: 4 }}>Viewer: <span style={{ color: "var(--info)" }}>yall click the view as guest button</span> </div>
                </div>
            </div>
        </div>
    );
}
