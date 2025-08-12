import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { z } from "zod";

import { lmsrCostDelta } from "@/lib/lmsr";

import { getDemoUser } from "../_util";
import { Prisma } from "@prisma/client";

const TradeSchema = z.object({
marketId: z.string(),
outcome: z.enum(["YES", "NO"]),
shares: z.number().int().min(1).max(100000)
});

export async function POST(req: NextRequest) {
const body = await req.json();
const parsed = TradeSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
const user = await getDemoUser();
const { marketId, outcome, shares } = parsed.data;
const market = await prisma.market.findUnique({ where: { id: marketId }});
if (!market) return NextResponse.json({ error: "Market not found" }, { status: 404 });
if (market.resolved) return NextResponse.json({ error: "Market resolved" }, { status: 400 });
if (new Date() > market.closeTime) return NextResponse.json({ error: "Market closed" }, { status: 400 });

const costFloat = lmsrCostDelta(market.qYes, market.qNo, outcome, shares, market.b);
const cost = Math.ceil(costFloat);
const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: cost } }});
const m2 = await tx.market.update({
where: { id: market.id },
data: {
qYes: outcome === "YES" ? market.qYes + shares : market.qYes,
qNo: outcome === "NO" ? market.qNo + shares : market.qNo
}
});
const t = await tx.trade.create({
data: { userId: user.id, marketId: market.id, outcome, shares, cost }
});
return { market: m2, trade: t };
});
return NextResponse.json({ ok: true, cost, updatedMarket: updated.market });
}