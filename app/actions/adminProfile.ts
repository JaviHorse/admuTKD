"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function validateImage(value?: string | null) {
    if (!value) return null;
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(value)) throw new Error("Profile image must be a JPEG, PNG, or WebP file.");
    if (value.length > 1_500_000) throw new Error("Profile image is too large. Please choose a smaller image.");
    return value;
}

export async function getCurrentAdminProfile() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" || !session.user.id) throw new Error("Unauthorized");
    return prisma.user.findUnique({ where: { id: session.user.id }, include: { _count: { select: { dashboardPosts: true } } } });
}

export async function getPublicAdminProfile(id: string) {
    const profile = await prisma.user.findFirst({
        where: { id, role: "ADMIN" },
        select: {
            id: true, name: true, bio: true, profileImageUrl: true, createdAt: true,
            dashboardPosts: { orderBy: { createdAt: "desc" }, take: 20, include: { author: { select: { id: true, name: true, profileImageUrl: true } } } },
            _count: { select: { dashboardPosts: true } },
        },
    });
    if (!profile) return null;
    return {
        ...profile,
        profileImageUrl: profile.profileImageUrl ? `/api/admin-avatar/${profile.id}` : null,
        dashboardPosts: profile.dashboardPosts.map((post) => ({ ...post, author: { ...post.author, profileImageUrl: post.author.profileImageUrl ? `/api/admin-avatar/${post.author.id}` : null } })),
    };
}

export async function updateAdminProfile(data: { profileImageUrl?: string | null; bio?: string }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" || !session.user.id) throw new Error("Unauthorized");
    const profileImageUrl = validateImage(data.profileImageUrl);
    const bio = data.bio?.trim().slice(0, 500) || null;
    await prisma.user.update({ where: { id: session.user.id }, data: { profileImageUrl, bio } });
    revalidatePath("/dashboard");
    revalidatePath("/admin/profile");
    revalidatePath(`/admins/${session.user.id}`);
    return { hasProfileImage: Boolean(profileImageUrl) };
}
