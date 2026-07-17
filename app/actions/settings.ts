"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { trainingCancellationKey } from "@/lib/trainingSchedule";

export async function getUaapDate(): Promise<string | null> {
    const setting = await prisma.appSetting.findUnique({
        where: { key: "uaap_date" },
    });
    return setting?.value ?? null;
}

export async function setUaapDate(date: string | null): Promise<void> {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
    if (!date) {
        await prisma.appSetting.deleteMany({ where: { key: "uaap_date" } });
    } else {
        await prisma.appSetting.upsert({
            where: { key: "uaap_date" },
            create: { key: "uaap_date", value: date },
            update: { value: date },
        });
    }
    revalidatePath("/dashboard");
}

export async function isTrainingCancelled(dateKey: string): Promise<boolean> {
    const setting = await prisma.appSetting.findUnique({ where: { key: trainingCancellationKey(dateKey) } });
    return setting?.value === "true";
}

export async function setTrainingCancelled(dateKey: string, cancelled: boolean): Promise<void> {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new Error("Invalid training date");
    const key = trainingCancellationKey(dateKey);
    if (cancelled) {
        await prisma.appSetting.upsert({ where: { key }, create: { key, value: "true" }, update: { value: "true" } });
    } else {
        await prisma.appSetting.deleteMany({ where: { key } });
    }
    revalidatePath("/dashboard");
    revalidatePath("/admin/settings");
}
