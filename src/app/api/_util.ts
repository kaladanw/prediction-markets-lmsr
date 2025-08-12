import { prisma } from "@/lib/prisma";

export async function getDemoUser() {
let u = await prisma.user.findUnique({ where: { email: "demo@user.local" }});
if (!u) u = await prisma.user.create({ data: { email: "demo@user.local", balance: 100000 }});
return u;
}