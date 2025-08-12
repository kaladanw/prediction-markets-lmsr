import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { z } from "zod";
import { Prisma } from "@prisma/client";

const ResolveSchema = z.object({
marketId: z.string(),
resolution: z.enum(["YES", "NO"])
});

export async function POST(req: NextRequest) {
const body = await req.json();
const parsed = ResolveSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
const { marketId, resolution } = parsed.data;
const market = await prisma.market.findUnique({ where: { id: marketId }});
if (!market) return NextResponse.json({ error: "Market not found" }, { status: 404 });
if (market.resolved) return NextResponse.json({ error: "Already resolved" }, { status: 400 });

const payoutPerShare = 100;
const res = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
const trades = await tx.trade.findMany({ where: { marketId }});
const positions = new Map<string, { yes: number; no: number }>();
for (const tr of trades) {
const pos = positions.get(tr.userId) ?? { yes: 0, no: 0 };
if (tr.outcome === "YES") pos.yes += tr.shares;
else pos.no += tr.shares;
positions.set(tr.userId, pos);
}
for (const [uid, pos] of positions) {
const winningShares = resolution === "YES" ? pos.yes : pos.no;
const payout = winningShares * payoutPerShare;
if (payout > 0) {
await tx.user.update({ where: { id: uid }, data: { balance: { increment: payout } }});
}
}
return tx.market.update({ where: { id: marketId }, data: { resolved: true, resolution }});
});
return NextResponse.json({ ok: true, market: res });
}