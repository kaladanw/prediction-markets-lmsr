import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { z } from "zod";

import { getDemoUser } from "../_util";

const CreateSchema = z.object({
question: z.string().min(5).max(200),
closeTime: z.string(),
b: z.number().int().min(5000).max(200000)
});

export async function POST(req: NextRequest) {
const body = await req.json();
const parsed = CreateSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
const user = await getDemoUser();
const { question, closeTime, b } = parsed.data;
const m = await prisma.market.create({
data: { question, closeTime: new Date(closeTime), b, creatorId: user.id }
});
return NextResponse.json(m);
}

export async function GET() {
const markets = await prisma.market.findMany({ orderBy: { createdAt: "desc" }});
return NextResponse.json(markets);
}