import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
const m = await prisma.market.findUnique({ where: { id: params.id }});
if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
return NextResponse.json(m);
}