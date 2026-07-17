"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getCoaches(activeOnly?: boolean) {
    const where = activeOnly ? { isActive: true } : {};
    return prisma.coach.findMany({
        where,
        orderBy: { fullName: "asc" },
    });
}

export async function getCoachById(id: string) {
    return prisma.coach.findUnique({
        where: { id },
        include: {
            sessions: {
                include: {
                    session: {
                        include: {
                            attendance: true,
                        },
                    },
                },
                orderBy: { session: { sessionDate: "desc" } },
            },
        },
    });
}

export async function createCoach(data: {
    fullName: string;
    roleTitle?: string;
    isActive?: boolean;
    profileImageUrl?: string | null;
}) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const profileImageUrl = validateProfileImage(data.profileImageUrl);
    const coach = await prisma.coach.create({
        data: {
            fullName: data.fullName,
            roleTitle: data.roleTitle,
            profileImageUrl,
            isActive: data.isActive ?? true,
        },
    });
    revalidatePath("/admin/coaches");
    revalidatePath("/coaches");
    return coach;
}

export async function updateCoach(
    id: string,
    data: { fullName?: string; roleTitle?: string; isActive?: boolean; profileImageUrl?: string | null }
) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const coach = await prisma.coach.update({
        where: { id },
        data: { ...data, ...(data.profileImageUrl !== undefined ? { profileImageUrl: validateProfileImage(data.profileImageUrl) } : {}) },
    });
    revalidatePath("/admin/coaches");
    revalidatePath("/coaches");
    revalidatePath(`/coaches/${id}`);
    return coach;
}

function validateProfileImage(value?: string | null) {
    if (!value) return null;
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(value)) throw new Error("Profile image must be a JPEG, PNG, or WebP file.");
    if (value.length > 1_500_000) throw new Error("Profile image is too large. Please choose a smaller image.");
    return value;
}

export async function deleteCoach(id: string) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.coach.delete({ where: { id } });
    revalidatePath("/admin/coaches");
    revalidatePath("/coaches");
}

