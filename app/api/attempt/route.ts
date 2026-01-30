import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

  return NextResponse.json({ ok: true });
}
