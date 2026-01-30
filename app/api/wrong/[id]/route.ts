import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeJsonParse } from "@/lib/testGen";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const attempt = await prisma.attempt.findUnique({ where: { id: params.id } });
  if (!attempt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
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
  });
}
