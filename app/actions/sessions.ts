"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getSessionsInSemester } from "@/lib/computations";

export async function getSessions(semesterId?: string) {
    if (semesterId) {
        const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
        if (!semester) return [];
        return prisma.session.findMany({
            where: {
                sessionDate: {
                    gte: semester.startDate,
                    lte: semester.endDate,
                },
            },
            include: {
                coaches: { include: { coach: true } },
                attendance: true,
            },
            orderBy: { sessionDate: "desc" },
        });
    }
    return prisma.session.findMany({
        orderBy: { sessionDate: "desc" },
        include: {
            coaches: { include: { coach: true } },
            attendance: true,
        },
    });
}

export async function getSessionById(id: string) {
    return prisma.session.findUnique({
        where: { id },
        include: {
            coaches: { include: { coach: true } },
            attendance: {
                include: { player: true },
                orderBy: { player: { fullName: "asc" } },
            },
        },
    });
}

export async function createSession(data: {
    sessionDate: Date;
    sessionType?: string;
    location?: string;
    notes?: string;
    coachIds?: string[];
}) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    console.log("Creating session with data:", JSON.stringify(data, null, 2));

    // Validation
    if (!data.sessionDate || isNaN(data.sessionDate.getTime())) {
        throw new Error("Invalid session date provided.");
    }

    try {
        const newSession = await prisma.session.create({
            data: {
                sessionDate: data.sessionDate,
                sessionType: data.sessionType || "Practice",
                location: data.location,
                notes: data.notes,
            },
        });

        if (data.coachIds && data.coachIds.length > 0) {
            await prisma.sessionCoach.createMany({
                data: data.coachIds.map((coachId) => ({
                    sessionId: newSession.id,
                    coachId,
                })),
            });
        }

        revalidatePath("/admin/sessions/new");
        revalidatePath("/sessions");
        revalidatePath("/dashboard");
        return newSession;
    } catch (error) {
        console.error("Prisma Error details:", error);
        throw error;
    }
}

export async function updateSession(
    id: string,
    data: {
        sessionDate?: Date;
        sessionType?: string;
        location?: string;
        notes?: string;
        coachIds?: string[];
    }
) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const updatedSession = await prisma.session.update({
        where: { id },
        data: {
            sessionDate: data.sessionDate,
            sessionType: data.sessionType,
            location: data.location,
            notes: data.notes,
        },
    });

    if (data.coachIds !== undefined) {
        await prisma.sessionCoach.deleteMany({ where: { sessionId: id } });
        if (data.coachIds.length > 0) {
            await prisma.sessionCoach.createMany({
                data: data.coachIds.map((coachId) => ({
                    sessionId: id,
                    coachId,
                })),
            });
        }
    }

    revalidatePath(`/sessions/${id}`);
    revalidatePath("/sessions");
    return updatedSession;
}

export async function markAttendance(
    sessionId: string,
    records: Array<{ playerId: string; status: string; note?: string }>
) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    for (const record of records) {
        await prisma.attendanceRecord.upsert({
            where: {
                sessionId_playerId: {
                    sessionId,
                    playerId: record.playerId,
                },
            },
            update: {
                status: record.status,
                note: record.note,
            },
            create: {
                sessionId,
                playerId: record.playerId,
                status: record.status,
                note: record.note,
            },
        });
    }

    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath(`/admin/sessions/${sessionId}/attendance`);
    revalidatePath("/sessions");
    revalidatePath("/dashboard");
    revalidatePath("/");
}

export async function deleteSession(id: string) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.session.delete({ where: { id } });

    revalidatePath("/sessions");
    revalidatePath("/dashboard");
    revalidatePath("/");
}

