import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { escapeRegExp, randomSample, shuffle, uniqueChoices } from "@/lib/testGen";

const TOTAL = 10;
const MCQ_COUNT = 6;
const BLANK_COUNT = 4;

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

  const words = await prisma.word.findMany({
    where: level ? { level } : undefined,
    orderBy: [{ level: "asc" }, { word: "asc" }],
  });

  if (words.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  const mcqWords = randomSample(words, Math.min(MCQ_COUNT, words.length));
  const remainingWords = words.filter((word) => !mcqWords.some((w) => w.id === word.id));
  const blankWords = randomSample(
    remainingWords.length >= BLANK_COUNT ? remainingWords : words,
    Math.min(BLANK_COUNT, words.length)
  );

  const mcqQuestions = mcqWords.map((word) => {
    const pool = words.filter((w) => w.id !== word.id && w.level === word.level);
    const fallbackPool = words.filter((w) => w.id !== word.id);
    const distractors = randomSample(pool.length >= 3 ? pool : fallbackPool, 3).map(
      (w) => w.meaningKo
    );
    const choices = uniqueChoices(shuffle([word.meaningKo, ...distractors]), 4);

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
    };
  });

  const blankQuestions = blankWords.map((word) => {
    const blanked = blankExample(word.example, word.word);
    const prompt = blanked
      ? `Fill in the blank: ${blanked} (word meaning: ${word.meaningKo})`
      : `Fill in the blank: ___ (word meaning: ${word.meaningKo})`;

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
    };
  });

  const questions = shuffle([...mcqQuestions, ...blankQuestions]).slice(0, TOTAL);

  return NextResponse.json({ questions });
}
