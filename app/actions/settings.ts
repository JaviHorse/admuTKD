"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUaapDate(): Promise<string | null> {
    const setting = await prisma.appSetting.findUnique({
        where: { key: "uaap_date" },
    });
    return setting?.value ?? null;
}

export async function setUaapDate(date: string | null): Promise<void> {
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
