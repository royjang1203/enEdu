import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") ?? undefined;

  const words = await prisma.word.findMany({
    where: level ? { level } : undefined,
    orderBy: [{ level: "asc" }, { word: "asc" }],
  });

  return NextResponse.json(words);
}
