import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomSample, safeJsonParse, shuffle, uniqueChoices } from "@/lib/testGen";

const TOTAL = 10;
const MCQ_COUNT = 6;
const BLANK_COUNT = 4;

const BE_VERBS = ["am", "is", "are"];

type Mode = "mixed" | "reviewWrong";

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
        kind: "grammar",
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
        kind: "grammar" as const,
        type: attempt.type as "mcq" | "blank",
        level: attempt.level,
        prompt: attempt.prompt,
        choices: choices.length ? choices : undefined,
        answer: attempt.answer,
        explanation: attempt.explanation,
        source: {
          grammarId: attempt.sourceId,
          title: "",
        },
      };
    });

    return NextResponse.json({ questions });
  }

  const masteredIds = deviceId
    ? await prisma.reviewState.findMany({
        where: {
          deviceId,
          kind: "grammar",
          isMastered: true,
          ...(level ? { level } : {}),
        },
        select: { sourceId: true },
      })
    : [];
  const masteredIdList = masteredIds.map((state) => state.sourceId);

  const topics = await prisma.grammarTopic.findMany({
    where: {
      ...(level ? { level } : {}),
      ...(deviceId && masteredIdList.length ? { id: { notIn: masteredIdList } } : {}),
    },
    orderBy: [{ level: "asc" }, { title: "asc" }],
  });

  if (topics.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  const dueStates = deviceId
    ? await prisma.reviewState.findMany({
        where: {
          deviceId,
          kind: "grammar",
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
  const dueTopics = dueIds.length
    ? await prisma.grammarTopic.findMany({ where: { id: { in: dueIds } } })
    : [];
  const dueMap = new Map(dueTopics.map((topic) => [topic.id, topic]));
  const dueOrdered = dueStates
    .map((state) => dueMap.get(state.sourceId))
    .filter((topic): topic is (typeof dueTopics)[number] => Boolean(topic));

  const dueTarget = Math.round(TOTAL * 0.6);
  const selectedDue = dueOrdered.slice(0, dueTarget);
  const selectedIds = new Set(selectedDue.map((topic) => topic.id));
  const randomPool = topics.filter((topic) => !selectedIds.has(topic.id) && !dueIdSet.has(topic.id));
  let selectedTopics = [...selectedDue];
  if (selectedTopics.length < TOTAL) {
    const needed = TOTAL - selectedTopics.length;
    selectedTopics = selectedTopics.concat(randomSample(randomPool, needed));
  }
  if (selectedTopics.length < TOTAL) {
    const needed = TOTAL - selectedTopics.length;
    const fallbackPool = topics.filter((topic) => !selectedTopics.some((item) => item.id === topic.id));
    selectedTopics = selectedTopics.concat(randomSample(fallbackPool, needed));
  }
  const finalTopics = selectedTopics.slice(0, TOTAL);

  const reviewStates =
    deviceId && finalTopics.length
      ? await prisma.reviewState.findMany({
          where: {
            deviceId,
            kind: "grammar",
            sourceId: { in: finalTopics.map((topic) => topic.id) },
          },
        })
      : [];
  const reviewMap = new Map(reviewStates.map((state) => [state.sourceId, state]));

  const mcqTarget = Math.min(MCQ_COUNT, finalTopics.length);
  const mcqTopics = randomSample(finalTopics, mcqTarget);
  const remaining = finalTopics.filter((topic) => !mcqTopics.some((t) => t.id === topic.id));
  const blankTarget = Math.min(BLANK_COUNT, finalTopics.length - mcqTopics.length);
  const blankTopics = randomSample(
    remaining.length >= blankTarget ? remaining : finalTopics,
    blankTarget
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

    const reviewState = reviewMap.get(topic.id);
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
      reviewState: reviewState
        ? { isMastered: reviewState.isMastered, nextReviewAt: reviewState.nextReviewAt }
        : null,
    };
  });

  const blankQuestions = blankTopics.map((topic) => {
    const examples = safeJsonParse<string[]>(topic.examplesJson, []);
    const sentence = examples[0] ?? "";
    const token = pickBlankToken(sentence);
    const blanked = blankSentence(sentence, token);

    const reviewState = reviewMap.get(topic.id);
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
      reviewState: reviewState
        ? { isMastered: reviewState.isMastered, nextReviewAt: reviewState.nextReviewAt }
        : null,
    };
  });

  const questions = shuffle([...mcqQuestions, ...blankQuestions]).slice(0, TOTAL);

  return NextResponse.json({ questions });
}
