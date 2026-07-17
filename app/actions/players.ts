"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getPlayers(activeOnly?: boolean) {
    const where = activeOnly ? { isActive: true } : {};
    return prisma.player.findMany({
        where,
        orderBy: { fullName: "asc" },
    });
}

export async function getPlayerById(id: string) {
    return prisma.player.findUnique({
        where: { id },
        include: {
            attendanceRecords: {
                include: { session: true },
                orderBy: { session: { sessionDate: "desc" } },
                take: 10,
            },
            competitionResults: {
                include: { competition: true },
                orderBy: { competition: { competitionDate: "desc" } },
            },
        },
    });
}

type PlayerInput = { fullName: string; isActive?: boolean; profileImageUrl?: string | null };

function validateProfileImage(value?: string | null) {
    if (!value) return null;
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(value)) throw new Error("Profile image must be a JPEG, PNG, or WebP file.");
    if (value.length > 1_500_000) throw new Error("Profile image is too large. Please choose a smaller image.");
    return value;
}

export async function createPlayer(data: PlayerInput) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const player = await prisma.player.create({
        data: { fullName: data.fullName, profileImageUrl: validateProfileImage(data.profileImageUrl), isActive: data.isActive ?? true },
    });
    revalidatePath("/admin/players");
    revalidatePath("/players");
    return player;
}

export async function updatePlayer(
    id: string,
    data: { fullName?: string; isActive?: boolean; profileImageUrl?: string | null }
) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const player = await prisma.player.update({
        where: { id },
        data: { ...data, ...(data.profileImageUrl !== undefined ? { profileImageUrl: validateProfileImage(data.profileImageUrl) } : {}) },
    });
    revalidatePath("/admin/players");
    revalidatePath("/players");
    revalidatePath(`/players/${id}`);
    return player;
}

export async function deletePlayer(id: string) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.player.delete({ where: { id } });
    revalidatePath("/admin/players");
    revalidatePath("/players");
}

