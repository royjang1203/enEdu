import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const kind = searchParams.get("kind");
  const level = searchParams.get("level") ?? undefined;

  if (!deviceId || !kind) {
    return NextResponse.json({ error: "deviceId and kind are required" }, { status: 400 });
  }

  if (kind !== "vocab" && kind !== "grammar") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const now = new Date();
  const items = await prisma.reviewState.findMany({
    where: {
      deviceId,
      kind,
      isMastered: false,
      nextReviewAt: { lte: now },
      ...(level ? { level } : {}),
    },
    orderBy: { nextReviewAt: "asc" },
    take: 50,
  });

  return NextResponse.json(items);
}
