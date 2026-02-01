import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type GrammarSeed = {
  title: string;
  level: "Level1" | "Level2" | "Level3" | "Level4" | "MIX";
  grade: number;
  ruleSummary: string;
  examples: string[];
  examplesKo: string[];
  commonMistakes: string[];
  commonMistakesKo: string[];
};

type CsvRow = Record<string, string>;

type CsvParseResult = {
  headers: string[];
  rows: CsvRow[];
};

function parseCsv(content: string): CsvParseResult {
  const rows: string[][] = [];
  let current: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      current.push(value);
      value = "";
      continue;
    }

    if (!inQuotes && char === "\n") {
      current.push(value);
      value = "";
      const trimmed = current.map((cell) => cell.trim());
      if (trimmed.length > 1 || trimmed[0]) {
        rows.push(trimmed);
      }
      current = [];
      continue;
    }

    if (char === "\r") {
      continue;
    }

    value += char;
  }

  if (value.length > 0 || current.length > 0) {
    current.push(value);
    const trimmed = current.map((cell) => cell.trim());
    if (trimmed.length > 1 || trimmed[0]) {
      rows.push(trimmed);
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0].map((header) => header.trim());
  const dataRows = rows.slice(1);
  const parsedRows: CsvRow[] = dataRows.map((row) => {
    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });

  return { headers, rows: parsedRows };
}

function loadVocabCsv(): CsvRow[] {
  const csvPath = path.join(process.cwd(), "lib", "elementary_vocab.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const parsed = parseCsv(content);

  const required = [
    "level",
    "grade",
    "word",
    "pos",
    "meaning_ko",
    "example_en",
    "example_ko",
    "tags",
  ];

  for (const header of required) {
    if (!parsed.headers.includes(header)) {
      throw new Error(`Missing CSV column: ${header}`);
    }
  }

  return parsed.rows;
}

function splitList(value: string): string[] {
  return value
    ? value
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function loadGrammarCsv(): GrammarSeed[] {
  const csvPath = path.join(process.cwd(), "lib", "elementary_grammar.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const parsed = parseCsv(content);

  const required = [
    "level",
    "grade",
    "title",
    "rule_summary",
    "examples_en",
    "examples_ko",
    "common_mistakes_en",
    "common_mistakes_ko",
  ];

  for (const header of required) {
    if (!parsed.headers.includes(header)) {
      throw new Error(`Missing grammar CSV column: ${header}`);
    }
  }

  return parsed.rows.map((row, index) => {
    const gradeValue = Number(row.grade);
    if (!Number.isFinite(gradeValue)) {
      throw new Error(`Invalid grammar grade at row ${index + 2}: ${row.grade}`);
    }

    return {
      title: row.title,
      level: row.level as GrammarSeed["level"],
      grade: gradeValue,
      ruleSummary: row.rule_summary,
      examples: splitList(row.examples_en),
      examplesKo: splitList(row.examples_ko),
      commonMistakes: splitList(row.common_mistakes_en),
      commonMistakesKo: splitList(row.common_mistakes_ko),
    };
  });
}


async function main() {
  // Clean tables for deterministic seed
  const prismaAny = prisma as PrismaClient & {
    attempt?: { deleteMany: () => Promise<unknown> };
    reviewState?: { deleteMany: () => Promise<unknown> };
  };
  if (prismaAny.attempt) {
    await prismaAny.attempt.deleteMany();
  }
  if (prismaAny.reviewState) {
    await prismaAny.reviewState.deleteMany();
  }
  await prisma.word.deleteMany();
  await prisma.grammarTopic.deleteMany();

  const vocabRows = loadVocabCsv();
  const vocabData = vocabRows.map((row, index) => {
    const gradeValue = Number(row.grade);
    if (!Number.isFinite(gradeValue)) {
      throw new Error(`Invalid grade at row ${index + 2}: ${row.grade}`);
    }

    const tags = row.tags
      ? row.tags
          .split(/[|;]/)
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    return {
      word: row.word,
      pos: row.pos,
      meaningKo: row.meaning_ko,
      level: row.level,
      grade: gradeValue,
      exampleEn: row.example_en,
      exampleKo: row.example_ko,
      tagsJson: JSON.stringify(tags),
    };
  });

  if (vocabData.length > 0) {
    await prisma.word.createMany({ data: vocabData as any });
  }

  const grammarTopics = loadGrammarCsv();

  const grammarData = grammarTopics.map((g) => ({
    title: g.title,
    level: g.level,
    grade: g.grade,
    ruleSummary: g.ruleSummary,
    examplesJson: JSON.stringify(g.examples),
    examplesKoJson: JSON.stringify(g.examplesKo),
    commonMistakesJson: JSON.stringify(g.commonMistakes),
    commonMistakesKoJson: JSON.stringify(g.commonMistakesKo),
  }));

  await prisma.grammarTopic.createMany({ data: grammarData as any });

  console.log(`Seeded: words=${vocabData.length}, grammarTopics=${grammarTopics.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
