import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { defaultReviewState, updateReviewState } from "@/lib/spaced";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.deviceId || !body?.attempt) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const attempt = body.attempt as {
    kind: "vocab" | "grammar";
    questionId: string;
    sourceId: string;
    type: "mcq" | "blank";
    level: string;
    prompt: string;
    choices?: string[];
    answer: string;
    chosen: string;
    isCorrect: boolean;
    explanation: string;
  };

  await prisma.attempt.create({
    data: {
      deviceId: body.deviceId,
      kind: attempt.kind,
      questionId: attempt.questionId,
      sourceId: attempt.sourceId,
      type: attempt.type,
      level: attempt.level,
      prompt: attempt.prompt,
      choicesJson: JSON.stringify(attempt.choices ?? []),
      answer: attempt.answer,
      chosen: attempt.chosen,
      isCorrect: attempt.isCorrect,
      explanation: attempt.explanation,
    },
  });

  const now = new Date();
  const baseState = defaultReviewState(now);
  const state = await prisma.reviewState.upsert({
    where: {
      deviceId_kind_sourceId: {
        deviceId: body.deviceId,
        kind: attempt.kind,
        sourceId: attempt.sourceId,
      },
    },
    update: {},
    create: {
      deviceId: body.deviceId,
      kind: attempt.kind,
      sourceId: attempt.sourceId,
      level: attempt.level,
      intervalDays: baseState.intervalDays,
      easeFactor: baseState.easeFactor,
      streak: baseState.streak,
      nextReviewAt: baseState.nextReviewAt,
      isMastered: baseState.isMastered,
    },
  });

  const next = updateReviewState(state, attempt.isCorrect, now);
  await prisma.reviewState.update({
    where: { id: state.id },
    data: {
      level: attempt.level,
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      streak: next.streak,
      nextReviewAt: next.nextReviewAt,
      isMastered: next.isMastered,
    },
  });

  return NextResponse.json({ ok: true });
}
