import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;
    const hasGuestAccess = req.cookies.has("guest_access");

    // Redirect unauthenticated users to login ONLY if they are NOT on the login page AND don't have guest access
    if (!session && !hasGuestAccess && pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect authenticated users away from login
    if (session && pathname === "/login") {
        const dest = session.user.role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(dest, req.url));
    }

    // Block ANY unauthenticated access (even guest) from /admin routes
    if (pathname.startsWith("/admin") && (!session || session.user.role !== "ADMIN")) {
        const dest = session ? "/dashboard" : "/login";
        return NextResponse.redirect(new URL(dest, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
