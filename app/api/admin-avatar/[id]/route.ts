import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await prisma.user.findFirst({ where: { id, role: "ADMIN" }, select: { profileImageUrl: true } });
    const match = user?.profileImageUrl?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!match) return new Response(null, { status: 404 });
    return new Response(Buffer.from(match[2], "base64"), {
        headers: { "Content-Type": match[1], "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
}
