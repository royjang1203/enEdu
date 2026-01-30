import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeJsonParse } from "@/lib/testGen";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const kind = searchParams.get("kind");
  const level = searchParams.get("level") ?? undefined;

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
  }

  const where: { deviceId: string; isCorrect: boolean; kind?: string; level?: string } = {
    deviceId,
    isCorrect: false,
  };
  if (kind && kind !== "all") {
    where.kind = kind;
  }
  if (level) {
    where.level = level;
  }

  const attempts = await prisma.attempt.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const vocabIds = Array.from(
    new Set(attempts.filter((a) => a.kind === "vocab").map((a) => a.sourceId))
  );
  const grammarIds = Array.from(
    new Set(attempts.filter((a) => a.kind === "grammar").map((a) => a.sourceId))
  );
  const reviewConditions = [
    vocabIds.length ? { kind: "vocab", sourceId: { in: vocabIds } } : undefined,
    grammarIds.length ? { kind: "grammar", sourceId: { in: grammarIds } } : undefined,
  ].filter(Boolean) as Array<{ kind: string; sourceId: { in: string[] } }>;
  const reviewStates = reviewConditions.length
    ? await prisma.reviewState.findMany({
        where: {
          deviceId,
          OR: reviewConditions,
        },
      })
    : [];
  const reviewMap = new Map(
    reviewStates.map((state) => [`${state.kind}:${state.sourceId}`, state])
  );

  const items = attempts
    .filter((attempt) => !reviewMap.get(`${attempt.kind}:${attempt.sourceId}`)?.isMastered)
    .map((attempt) => ({
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
    reviewState: reviewMap.has(`${attempt.kind}:${attempt.sourceId}`)
      ? {
          nextReviewAt: reviewMap.get(`${attempt.kind}:${attempt.sourceId}`)?.nextReviewAt,
          isMastered: reviewMap.get(`${attempt.kind}:${attempt.sourceId}`)?.isMastered ?? false,
        }
      : null,
    }));

  return NextResponse.json(items);
}
