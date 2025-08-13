import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";

const CreateSchema = z.object({
question: z.string().min(5).max(200),
closeTime: z.string(),
b: z.number().int().min(5000).max(200000)
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { question, closeTime, b } = parsed.data;
    const market = await prisma.market.create({
      data: { 
        question, 
        closeTime: new Date(closeTime), 
        b, 
        creatorId: user.id 
      }
    });
    
    return NextResponse.json(market);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create market' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const markets = await prisma.market.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(markets);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}