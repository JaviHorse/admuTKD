import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    // Public viewer routes that don't require login
    const isPublicRoute =
        pathname === "/dashboard" ||
        pathname === "/reports" ||
        pathname.startsWith("/players") ||
        pathname.startsWith("/coaches") ||
        pathname.startsWith("/sessions") ||
        pathname.startsWith("/competitions");

    // Redirect unauthenticated users to login ONLY if they try to access non-public routes
    if (!session && !isPublicRoute && pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect authenticated users away from login
    if (session && pathname === "/login") {
        const dest = session.user.role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(dest, req.url));
    }

    // Block non-admins from /admin routes
    if (session && pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Block guests from /admin routes
    if (!session && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
