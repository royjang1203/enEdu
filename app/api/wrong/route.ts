import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeJsonParse } from "@/lib/testGen";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const kind = searchParams.get("kind");

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
  }

  const where: { deviceId: string; isCorrect: boolean; kind?: string } = {
    deviceId,
    isCorrect: false,
  };
  if (kind && kind !== "all") {
    where.kind = kind;
  }

  const attempts = await prisma.attempt.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const items = attempts.map((attempt) => ({
    id: attempt.id,
    kind: attempt.kind,
    questionId: attempt.questionId,
    sourceId: attempt.sourceId,
    type: attempt.type,
    level: attempt.level,
    prompt: attempt.prompt,
    choices: safeJsonParse<string[]>(attempt.choicesJson, []),
    answer: attempt.answer,
    chosen: attempt.chosen,
    explanation: attempt.explanation,
    createdAt: attempt.createdAt,
  }));

  return NextResponse.json(items);
}
