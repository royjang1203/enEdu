import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomSample, safeJsonParse, shuffle, uniqueChoices } from "@/lib/testGen";

const TOTAL = 10;
const MCQ_COUNT = 6;
const BLANK_COUNT = 4;

const BE_VERBS = ["am", "is", "are"];

function pickBlankToken(sentence: string) {
  const lower = sentence.toLowerCase();
  for (const be of BE_VERBS) {
    const re = new RegExp(`\\b${be}\\b`, "i");
    if (re.test(sentence)) {
      return be;
    }
  }
  if (lower.includes(" will ")) {
    return "will";
  }

  const tokens = sentence.replace(/[^a-zA-Z\s']/g, "").split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    return tokens[1].toLowerCase();
  }
  return tokens[0]?.toLowerCase() ?? "";
}

function blankSentence(sentence: string, token: string) {
  if (!token) return sentence;
  const re = new RegExp(`\\b${token}\\b`, "i");
  return sentence.replace(re, "___");
}

function makeSimpleWrongVariant(sentence: string) {
  if (/\bis\b/i.test(sentence)) {
    return sentence.replace(/\bis\b/i, "are");
  }
  if (/\bare\b/i.test(sentence)) {
    return sentence.replace(/\bare\b/i, "is");
  }
  if (/\bam\b/i.test(sentence)) {
    return sentence.replace(/\bam\b/i, "is");
  }
  if (/\bwill\b/i.test(sentence)) {
    return sentence.replace(/\bwill\b/i, "wills");
  }
  const words = sentence.split(" ");
  if (words.length > 1) {
    const target = words[1];
    if (/s\b/i.test(target)) {
      words[1] = target.replace(/s\b/i, "");
    } else {
      words[1] = `${target}s`;
    }
  }
  return words.join(" ");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const level = body?.level as string | undefined;

  const topics = await prisma.grammarTopic.findMany({
    where: level ? { level } : undefined,
    orderBy: [{ level: "asc" }, { title: "asc" }],
  });

  if (topics.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  const mcqTopics = randomSample(topics, Math.min(MCQ_COUNT, topics.length));
  const remaining = topics.filter((topic) => !mcqTopics.some((t) => t.id === topic.id));
  const blankTopics = randomSample(
    remaining.length >= BLANK_COUNT ? remaining : topics,
    Math.min(BLANK_COUNT, topics.length)
  );

  const mcqQuestions = mcqTopics.map((topic) => {
    const examples = safeJsonParse<string[]>(topic.examplesJson, []);
    const correct = examples[0] ?? "";

    const otherTopics = topics.filter((t) => t.id !== topic.id);
    const mistakesPool = otherTopics.flatMap((t) => safeJsonParse<string[]>(t.commonMistakesJson, []));
    const examplePool = otherTopics.flatMap((t) => safeJsonParse<string[]>(t.examplesJson, []));

    let distractors = randomSample(mistakesPool, 3);
    if (distractors.length < 3) {
      const needed = 3 - distractors.length;
      distractors = distractors.concat(randomSample(examplePool, needed).map(makeSimpleWrongVariant));
    }

    const choices = uniqueChoices(shuffle([correct, ...distractors]), 4);

    return {
      id: `grammar-${topic.id}-mcq`,
      kind: "grammar",
      type: "mcq",
      level: topic.level,
      prompt: `Which sentence is correct according to: ${topic.title}?`,
      choices,
      answer: correct,
      explanation: `${topic.title}: ${topic.ruleSummary}`,
      source: {
        grammarId: topic.id,
        title: topic.title,
      },
    };
  });

  const blankQuestions = blankTopics.map((topic) => {
    const examples = safeJsonParse<string[]>(topic.examplesJson, []);
    const sentence = examples[0] ?? "";
    const token = pickBlankToken(sentence);
    const blanked = blankSentence(sentence, token);

    return {
      id: `grammar-${topic.id}-blank`,
      kind: "grammar",
      type: "blank",
      level: topic.level,
      prompt: `Fill in the blank based on the rule: ${topic.ruleSummary}\nSentence: ${blanked}`,
      answer: token,
      explanation: `${topic.title}: ${topic.ruleSummary}`,
      source: {
        grammarId: topic.id,
        title: topic.title,
      },
    };
  });

  const questions = shuffle([...mcqQuestions, ...blankQuestions]).slice(0, TOTAL);

  return NextResponse.json({ questions });
}
