import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { defaultReviewState } from "@/lib/spaced";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.deviceId || !body?.kind || !body?.sourceId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { deviceId, kind, sourceId, isMastered } = body as {
    deviceId: string;
    kind: "vocab" | "grammar";
    sourceId: string;
    isMastered: boolean;
  };

  if (kind !== "vocab" && kind !== "grammar") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  let level = "";
  const existing = await prisma.reviewState.findUnique({
    where: { deviceId_kind_sourceId: { deviceId, kind, sourceId } },
  });
  if (existing) {
    level = existing.level;
  } else if (kind === "vocab") {
    const word = await prisma.word.findUnique({ where: { id: sourceId } });
    level = word?.level ?? "";
  } else {
    const topic = await prisma.grammarTopic.findUnique({ where: { id: sourceId } });
    level = topic?.level ?? "";
  }

  const now = new Date();
  const baseState = defaultReviewState(now);
  const state = await prisma.reviewState.upsert({
    where: { deviceId_kind_sourceId: { deviceId, kind, sourceId } },
    update: {
      isMastered,
    },
    create: {
      deviceId,
      kind,
      sourceId,
      level,
      intervalDays: baseState.intervalDays,
      easeFactor: baseState.easeFactor,
      streak: baseState.streak,
      nextReviewAt: baseState.nextReviewAt,
      isMastered,
    },
  });

  return NextResponse.json({ ok: true, reviewState: state });
}
