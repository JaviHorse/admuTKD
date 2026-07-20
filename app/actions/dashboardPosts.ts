"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function validateImage(value?: string | null) {
    if (!value) return null;
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(value)) throw new Error("Post image must be a JPEG, PNG, or WebP file.");
    if (value.length > 1_500_000) throw new Error("Post image is too large. Please choose a smaller image.");
    return value;
}

export async function getDashboardPosts() {
    const posts = await prisma.dashboardPost.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { author: { select: { id: true, name: true, profileImageUrl: true } } },
    });
    return posts.map((post) => ({ ...post, author: { ...post.author, profileImageUrl: post.author.profileImageUrl ? `/api/admin-avatar/${post.author.id}` : null } }));
}

export async function createDashboardPost(data: { content?: string; imageUrl?: string | null }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" || !session.user.id) throw new Error("Unauthorized");
    const content = data.content?.trim().slice(0, 2000) || null;
    const imageUrl = validateImage(data.imageUrl);
    if (!content && !imageUrl) throw new Error("Add a message or image before publishing.");
    await prisma.dashboardPost.create({ data: { content, imageUrl, authorId: session.user.id } });
    revalidatePath("/dashboard");
}

export async function deleteDashboardPost(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
    await prisma.dashboardPost.deleteMany({ where: { id } });
    revalidatePath("/dashboard");
}

export async function likeDashboardPost(id: string) {
    const session = await auth();
    const cookieStore = await cookies();
    if (session?.user?.role === "ADMIN" || !cookieStore.has("guest_access")) {
        throw new Error("Only guest visitors can like team updates.");
    }
    if (!/^[a-zA-Z0-9_-]{10,64}$/.test(id)) throw new Error("Invalid post.");

    try {
        const post = await prisma.dashboardPost.update({
            where: { id },
            data: { likeCount: { increment: 1 } },
            select: { likeCount: true },
        });
        revalidatePath("/dashboard");
        return post.likeCount;
    } catch {
        throw new Error("This post is no longer available.");
    }
}
