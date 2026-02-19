"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSemesters() {
    return prisma.semester.findMany({
        orderBy: { startDate: "desc" },
    });
}

export async function getActiveSemester() {
    return prisma.semester.findFirst({
        where: { isActive: true },
        orderBy: { startDate: "desc" },
    });
}

export async function getSemesterById(id: string) {
    return prisma.semester.findUnique({ where: { id } });
}

export async function createSemester(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
}) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const semester = await prisma.semester.create({ data });
    revalidatePath("/admin/semesters");
    revalidatePath("/dashboard");
    return semester;
}

export async function updateSemester(
    id: string,
    data: {
        name?: string;
        startDate?: Date;
        endDate?: Date;
        isActive?: boolean;
    }
) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const semester = await prisma.semester.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/semesters");
    revalidatePath("/dashboard");
    return semester;
}

export async function deleteSemester(id: string) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.semester.delete({ where: { id } });
    revalidatePath("/admin/semesters");
    revalidatePath("/dashboard");
}

