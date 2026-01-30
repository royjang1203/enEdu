import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { escapeRegExp, randomSample, safeJsonParse, shuffle, uniqueChoices } from "@/lib/testGen";

const TOTAL = 10;
const MCQ_COUNT = 6;
const BLANK_COUNT = 4;

type Mode = "mixed" | "reviewWrong";

function blankExample(example: string, word: string) {
  const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  if (regex.test(example)) {
    return example.replace(regex, "___");
  }
  return "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const level = body?.level as string | undefined;
  const mode = (body?.mode === "reviewWrong" ? "reviewWrong" : "mixed") as Mode;
  const deviceId = body?.deviceId as string | undefined;
  const now = new Date();

  if (mode === "reviewWrong") {
    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        deviceId,
        kind: "vocab",
        isCorrect: false,
        ...(level ? { level } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const seen = new Set<string>();
    const selected = attempts.filter((attempt) => {
      if (seen.has(attempt.sourceId)) return false;
      seen.add(attempt.sourceId);
      return true;
    }).slice(0, TOTAL);

    const questions = selected.map((attempt) => {
      const choices = safeJsonParse<string[]>(attempt.choicesJson, []);
      return {
        id: attempt.questionId,
        kind: "vocab" as const,
        type: attempt.type as "mcq" | "blank",
        level: attempt.level,
        prompt: attempt.prompt,
        choices: choices.length ? choices : undefined,
        answer: attempt.answer,
        explanation: attempt.explanation,
        source: {
          wordId: attempt.sourceId,
          word: "",
          meaningKo: "",
        },
      };
    });

    return NextResponse.json({ questions });
  }

  const masteredIds = deviceId
    ? await prisma.reviewState.findMany({
        where: {
          deviceId,
          kind: "vocab",
          isMastered: true,
          ...(level ? { level } : {}),
        },
        select: { sourceId: true },
      })
    : [];
  const masteredIdList = masteredIds.map((state) => state.sourceId);

  const words = await prisma.word.findMany({
    where: {
      ...(level ? { level } : {}),
      ...(deviceId && masteredIdList.length ? { id: { notIn: masteredIdList } } : {}),
    },
    orderBy: [{ level: "asc" }, { word: "asc" }],
  });

  if (words.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  const dueStates = deviceId
    ? await prisma.reviewState.findMany({
        where: {
          deviceId,
          kind: "vocab",
          isMastered: false,
          nextReviewAt: { lte: now },
          ...(level ? { level } : {}),
        },
        orderBy: { nextReviewAt: "asc" },
        take: 50,
      })
    : [];
  const dueIds = dueStates.map((state) => state.sourceId);
  const dueIdSet = new Set(dueIds);
  const dueWords = dueIds.length
    ? await prisma.word.findMany({ where: { id: { in: dueIds } } })
    : [];
  const dueMap = new Map(dueWords.map((word) => [word.id, word]));
  const dueOrdered = dueStates
    .map((state) => dueMap.get(state.sourceId))
    .filter((word): word is (typeof dueWords)[number] => Boolean(word));

  const dueTarget = Math.round(TOTAL * 0.6);
  const selectedDue = dueOrdered.slice(0, dueTarget);
  const selectedIds = new Set(selectedDue.map((word) => word.id));
  const randomPool = words.filter((word) => !selectedIds.has(word.id) && !dueIdSet.has(word.id));
  let selectedWords = [...selectedDue];
  if (selectedWords.length < TOTAL) {
    const needed = TOTAL - selectedWords.length;
    selectedWords = selectedWords.concat(randomSample(randomPool, needed));
  }
  if (selectedWords.length < TOTAL) {
    const needed = TOTAL - selectedWords.length;
    const fallbackPool = words.filter((word) => !selectedWords.some((item) => item.id === word.id));
    selectedWords = selectedWords.concat(randomSample(fallbackPool, needed));
  }
  const finalWords = selectedWords.slice(0, TOTAL);

  const reviewStates =
    deviceId && finalWords.length
      ? await prisma.reviewState.findMany({
          where: {
            deviceId,
            kind: "vocab",
            sourceId: { in: finalWords.map((word) => word.id) },
          },
        })
      : [];
  const reviewMap = new Map(reviewStates.map((state) => [state.sourceId, state]));

  const mcqTarget = Math.min(MCQ_COUNT, finalWords.length);
  const mcqWords = randomSample(finalWords, mcqTarget);
  const remainingWords = finalWords.filter((word) => !mcqWords.some((w) => w.id === word.id));
  const blankTarget = Math.min(BLANK_COUNT, finalWords.length - mcqWords.length);
  const blankWords = randomSample(
    remainingWords.length >= blankTarget ? remainingWords : finalWords,
    blankTarget
  );

  const mcqQuestions = mcqWords.map((word) => {
    const pool = words.filter((w) => w.id !== word.id && w.level === word.level);
    const fallbackPool = words.filter((w) => w.id !== word.id);
    const distractors = randomSample(pool.length >= 3 ? pool : fallbackPool, 3).map(
      (w) => w.meaningKo
    );
    const choices = uniqueChoices(shuffle([word.meaningKo, ...distractors]), 4);

    const reviewState = reviewMap.get(word.id);
    return {
      id: `vocab-${word.id}-mcq`,
      kind: "vocab",
      type: "mcq",
      level: word.level,
      prompt: `Choose the correct Korean meaning for the English word: ${word.word}`,
      choices,
      answer: word.meaningKo,
      explanation: `'${word.word}' means '${word.meaningKo}'.`,
      source: {
        wordId: word.id,
        word: word.word,
        meaningKo: word.meaningKo,
      },
      reviewState: reviewState
        ? { isMastered: reviewState.isMastered, nextReviewAt: reviewState.nextReviewAt }
        : null,
    };
  });

  const blankQuestions = blankWords.map((word) => {
    const blanked = blankExample(word.example, word.word);
    const prompt = blanked
      ? `Fill in the blank: ${blanked} (word meaning: ${word.meaningKo})`
      : `Fill in the blank: ___ (word meaning: ${word.meaningKo})`;

    const reviewState = reviewMap.get(word.id);
    return {
      id: `vocab-${word.id}-blank`,
      kind: "vocab",
      type: "blank",
      level: word.level,
      prompt,
      answer: word.word,
      explanation: `'${word.word}' means '${word.meaningKo}'.`,
      source: {
        wordId: word.id,
        word: word.word,
        meaningKo: word.meaningKo,
      },
      reviewState: reviewState
        ? { isMastered: reviewState.isMastered, nextReviewAt: reviewState.nextReviewAt }
        : null,
    };
  });

  const questions = shuffle([...mcqQuestions, ...blankQuestions]).slice(0, TOTAL);

  return NextResponse.json({ questions });
}
