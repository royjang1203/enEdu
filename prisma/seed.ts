import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type WordSeed = {
  word: string;
  pos: string;
  meaningKo: string;
  level: "A1" | "A2" | "B1" | "B2";
  example: string;
  tags?: string[];
};

type GrammarSeed = {
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "MIX";
  ruleSummary: string;
  examples: string[];
  commonMistakes: string[];
};

const words: WordSeed[] = [
  // ===== A1 (30) =====
  { word: "book", pos: "n", meaningKo: "책", level: "A1", example: "This book is interesting.", tags: ["noun"] },
  { word: "apple", pos: "n", meaningKo: "사과", level: "A1", example: "I eat an apple every day.", tags: ["food"] },
  { word: "water", pos: "n", meaningKo: "물", level: "A1", example: "Please drink water.", tags: ["noun"] },
  { word: "student", pos: "n", meaningKo: "학생", level: "A1", example: "She is a student.", tags: ["people"] },
  { word: "teacher", pos: "n", meaningKo: "선생님", level: "A1", example: "My teacher is kind.", tags: ["people"] },
  { word: "family", pos: "n", meaningKo: "가족", level: "A1", example: "I love my family.", tags: ["people"] },
  { word: "friend", pos: "n", meaningKo: "친구", level: "A1", example: "He is my friend.", tags: ["people"] },
  { word: "home", pos: "n", meaningKo: "집", level: "A1", example: "I am at home.", tags: ["place"] },
  { word: "school", pos: "n", meaningKo: "학교", level: "A1", example: "I go to school.", tags: ["place"] },
  { word: "city", pos: "n", meaningKo: "도시", level: "A1", example: "Seoul is a big city.", tags: ["place"] },

  { word: "eat", pos: "v", meaningKo: "먹다", level: "A1", example: "We eat dinner at 7.", tags: ["verb"] },
  { word: "drink", pos: "v", meaningKo: "마시다", level: "A1", example: "I drink tea in the morning.", tags: ["verb"] },
  { word: "go", pos: "v", meaningKo: "가다", level: "A1", example: "I go to work by bus.", tags: ["verb"] },
  { word: "come", pos: "v", meaningKo: "오다", level: "A1", example: "Please come here.", tags: ["verb"] },
  { word: "see", pos: "v", meaningKo: "보다", level: "A1", example: "I see a bird.", tags: ["verb"] },
  { word: "like", pos: "v", meaningKo: "좋아하다", level: "A1", example: "I like music.", tags: ["verb"] },
  { word: "want", pos: "v", meaningKo: "원하다", level: "A1", example: "I want a new phone.", tags: ["verb"] },
  { word: "need", pos: "v", meaningKo: "필요하다", level: "A1", example: "I need help.", tags: ["verb"] },
  { word: "make", pos: "v", meaningKo: "만들다", level: "A1", example: "We make a cake.", tags: ["verb"] },
  { word: "play", pos: "v", meaningKo: "놀다/경기하다", level: "A1", example: "They play soccer.", tags: ["verb"] },

  { word: "happy", pos: "adj", meaningKo: "행복한", level: "A1", example: "I feel happy today.", tags: ["adj"] },
  { word: "sad", pos: "adj", meaningKo: "슬픈", level: "A1", example: "He looks sad.", tags: ["adj"] },
  { word: "big", pos: "adj", meaningKo: "큰", level: "A1", example: "It is a big house.", tags: ["adj"] },
  { word: "small", pos: "adj", meaningKo: "작은", level: "A1", example: "I have a small bag.", tags: ["adj"] },
  { word: "good", pos: "adj", meaningKo: "좋은", level: "A1", example: "This is a good idea.", tags: ["adj"] },
  { word: "bad", pos: "adj", meaningKo: "나쁜", level: "A1", example: "That was a bad mistake.", tags: ["adj"] },
  { word: "new", pos: "adj", meaningKo: "새로운", level: "A1", example: "I bought a new laptop.", tags: ["adj"] },
  { word: "old", pos: "adj", meaningKo: "오래된/늙은", level: "A1", example: "This is an old photo.", tags: ["adj"] },
  { word: "easy", pos: "adj", meaningKo: "쉬운", level: "A1", example: "This question is easy.", tags: ["adj"] },
  { word: "difficult", pos: "adj", meaningKo: "어려운", level: "A1", example: "Math can be difficult.", tags: ["adj"] },

  // ===== A2 (30) =====
  { word: "travel", pos: "v", meaningKo: "여행하다", level: "A2", example: "I want to travel abroad.", tags: ["verb"] },
  { word: "visit", pos: "v", meaningKo: "방문하다", level: "A2", example: "We visited my uncle.", tags: ["verb"] },
  { word: "arrive", pos: "v", meaningKo: "도착하다", level: "A2", example: "The train arrives at 9.", tags: ["verb"] },
  { word: "leave", pos: "v", meaningKo: "떠나다", level: "A2", example: "I leave home at 8.", tags: ["verb"] },
  { word: "cook", pos: "v", meaningKo: "요리하다", level: "A2", example: "He cooks pasta well.", tags: ["verb"] },
  { word: "clean", pos: "v", meaningKo: "청소하다", level: "A2", example: "I clean my room on weekends.", tags: ["verb"] },
  { word: "finish", pos: "v", meaningKo: "끝내다", level: "A2", example: "Please finish your homework.", tags: ["verb"] },
  { word: "choose", pos: "v", meaningKo: "고르다", level: "A2", example: "Choose one option.", tags: ["verb"] },
  { word: "answer", pos: "v", meaningKo: "대답하다", level: "A2", example: "She answered quickly.", tags: ["verb"] },
  { word: "practice", pos: "v", meaningKo: "연습하다", level: "A2", example: "I practice English every day.", tags: ["verb"] },

  { word: "message", pos: "n", meaningKo: "메시지", level: "A2", example: "I sent a message to you.", tags: ["noun"] },
  { word: "meeting", pos: "n", meaningKo: "회의", level: "A2", example: "The meeting starts at 2.", tags: ["noun"] },
  { word: "problem", pos: "n", meaningKo: "문제", level: "A2", example: "This problem is hard.", tags: ["noun"] },
  { word: "solution", pos: "n", meaningKo: "해결책", level: "A2", example: "We found a solution.", tags: ["noun"] },
  { word: "project", pos: "n", meaningKo: "프로젝트", level: "A2", example: "Our project is almost done.", tags: ["noun"] },
  { word: "schedule", pos: "n", meaningKo: "일정", level: "A2", example: "My schedule is busy.", tags: ["noun"] },
  { word: "health", pos: "n", meaningKo: "건강", level: "A2", example: "Health is important.", tags: ["noun"] },
  { word: "energy", pos: "n", meaningKo: "에너지", level: "A2", example: "I have more energy today.", tags: ["noun"] },
  { word: "weather", pos: "n", meaningKo: "날씨", level: "A2", example: "The weather is nice.", tags: ["noun"] },
  { word: "information", pos: "n", meaningKo: "정보", level: "A2", example: "I need more information.", tags: ["noun"] },

  { word: "careful", pos: "adj", meaningKo: "조심하는", level: "A2", example: "Be careful with the glass.", tags: ["adj"] },
  { word: "ready", pos: "adj", meaningKo: "준비된", level: "A2", example: "I am ready to start.", tags: ["adj"] },
  { word: "popular", pos: "adj", meaningKo: "인기 있는", level: "A2", example: "This app is popular.", tags: ["adj"] },
  { word: "different", pos: "adj", meaningKo: "다른", level: "A2", example: "They are very different.", tags: ["adj"] },
  { word: "important", pos: "adj", meaningKo: "중요한", level: "A2", example: "It is important to sleep.", tags: ["adj"] },
  { word: "free", pos: "adj", meaningKo: "무료의/한가한", level: "A2", example: "Are you free this evening?", tags: ["adj"] },
  { word: "busy", pos: "adj", meaningKo: "바쁜", level: "A2", example: "I am busy right now.", tags: ["adj"] },
  { word: "safe", pos: "adj", meaningKo: "안전한", level: "A2", example: "This area is safe.", tags: ["adj"] },
  { word: "sure", pos: "adj", meaningKo: "확신하는", level: "A2", example: "I am sure about it.", tags: ["adj"] },
  { word: "possible", pos: "adj", meaningKo: "가능한", level: "A2", example: "Is it possible to reschedule?", tags: ["adj"] },

  // ===== B1 (40) =====
  { word: "improve", pos: "v", meaningKo: "개선하다", level: "B1", example: "I want to improve my English.", tags: ["verb"] },
  { word: "increase", pos: "v", meaningKo: "증가하다", level: "B1", example: "Prices increased last month.", tags: ["verb"] },
  { word: "reduce", pos: "v", meaningKo: "줄이다", level: "B1", example: "We should reduce waste.", tags: ["verb"] },
  { word: "decide", pos: "v", meaningKo: "결정하다", level: "B1", example: "I decided to study harder.", tags: ["verb"] },
  { word: "suggest", pos: "v", meaningKo: "제안하다", level: "B1", example: "She suggested a new plan.", tags: ["verb"] },
  { word: "prevent", pos: "v", meaningKo: "막다/예방하다", level: "B1", example: "This can prevent problems.", tags: ["verb"] },
  { word: "manage", pos: "v", meaningKo: "관리하다", level: "B1", example: "He manages a small team.", tags: ["verb"] },
  { word: "support", pos: "v", meaningKo: "지원하다", level: "B1", example: "We support each other.", tags: ["verb"] },
  { word: "develop", pos: "v", meaningKo: "개발하다", level: "B1", example: "They develop new features.", tags: ["verb"] },
  { word: "compare", pos: "v", meaningKo: "비교하다", level: "B1", example: "Compare these two options.", tags: ["verb"] },

  { word: "benefit", pos: "n", meaningKo: "이점/혜택", level: "B1", example: "There are many benefits.", tags: ["noun"] },
  { word: "risk", pos: "n", meaningKo: "위험", level: "B1", example: "Every investment has risk.", tags: ["noun"] },
  { word: "result", pos: "n", meaningKo: "결과", level: "B1", example: "The result was surprising.", tags: ["noun"] },
  { word: "effort", pos: "n", meaningKo: "노력", level: "B1", example: "Success needs effort.", tags: ["noun"] },
  { word: "choice", pos: "n", meaningKo: "선택", level: "B1", example: "You have a choice.", tags: ["noun"] },
  { word: "experience", pos: "n", meaningKo: "경험", level: "B1", example: "It was a great experience.", tags: ["noun"] },
  { word: "opportunity", pos: "n", meaningKo: "기회", level: "B1", example: "This is a good opportunity.", tags: ["noun"] },
  { word: "challenge", pos: "n", meaningKo: "도전/과제", level: "B1", example: "This task is a challenge.", tags: ["noun"] },
  { word: "resource", pos: "n", meaningKo: "자원", level: "B1", example: "Time is a limited resource.", tags: ["noun"] },
  { word: "quality", pos: "n", meaningKo: "품질", level: "B1", example: "We focus on quality.", tags: ["noun"] },

  { word: "likely", pos: "adv", meaningKo: "아마도", level: "B1", example: "It will likely rain.", tags: ["adv"] },
  { word: "instead", pos: "adv", meaningKo: "대신에", level: "B1", example: "Let’s walk instead.", tags: ["adv"] },
  { word: "usually", pos: "adv", meaningKo: "보통", level: "B1", example: "I usually wake up early.", tags: ["adv"] },
  { word: "recently", pos: "adv", meaningKo: "최근에", level: "B1", example: "I recently changed jobs.", tags: ["adv"] },
  { word: "probably", pos: "adv", meaningKo: "아마도", level: "B1", example: "He is probably right.", tags: ["adv"] },

  { word: "effective", pos: "adj", meaningKo: "효과적인", level: "B1", example: "This method is effective.", tags: ["adj"] },
  { word: "valuable", pos: "adj", meaningKo: "가치 있는", level: "B1", example: "Your time is valuable.", tags: ["adj"] },
  { word: "available", pos: "adj", meaningKo: "이용 가능한", level: "B1", example: "Rooms are available.", tags: ["adj"] },
  { word: "familiar", pos: "adj", meaningKo: "익숙한", level: "B1", example: "I am familiar with it.", tags: ["adj"] },
  { word: "comfortable", pos: "adj", meaningKo: "편안한", level: "B1", example: "This chair is comfortable.", tags: ["adj"] },

  // B1 계속 (40 채우기)
  { word: "require", pos: "v", meaningKo: "요구하다", level: "B1", example: "This job requires experience.", tags: ["verb"] },
  { word: "consider", pos: "v", meaningKo: "고려하다", level: "B1", example: "Consider other options.", tags: ["verb"] },
  { word: "avoid", pos: "v", meaningKo: "피하다", level: "B1", example: "Try to avoid mistakes.", tags: ["verb"] },
  { word: "explain", pos: "v", meaningKo: "설명하다", level: "B1", example: "Please explain your idea.", tags: ["verb"] },
  { word: "focus", pos: "v", meaningKo: "집중하다", level: "B1", example: "Focus on the basics.", tags: ["verb"] },
  { word: "purpose", pos: "n", meaningKo: "목적", level: "B1", example: "What is the purpose?", tags: ["noun"] },
  { word: "detail", pos: "n", meaningKo: "세부사항", level: "B1", example: "Check the details.", tags: ["noun"] },
  { word: "option", pos: "n", meaningKo: "선택지", level: "B1", example: "Pick an option.", tags: ["noun"] },
  { word: "habit", pos: "n", meaningKo: "습관", level: "B1", example: "Reading is a good habit.", tags: ["noun"] },
  { word: "progress", pos: "n", meaningKo: "진전", level: "B1", example: "You made good progress.", tags: ["noun"] },
  { word: "certain", pos: "adj", meaningKo: "확실한", level: "B1", example: "I am certain about that.", tags: ["adj"] },
  { word: "serious", pos: "adj", meaningKo: "심각한", level: "B1", example: "This is a serious issue.", tags: ["adj"] },
  { word: "responsible", pos: "adj", meaningKo: "책임 있는", level: "B1", example: "Be responsible for your work.", tags: ["adj"] },
  { word: "independent", pos: "adj", meaningKo: "독립적인", level: "B1", example: "She is very independent.", tags: ["adj"] },
  { word: "common", pos: "adj", meaningKo: "흔한/공통의", level: "B1", example: "This is a common mistake.", tags: ["adj"] },

  // ===== B2 (20) =====
  { word: "analyze", pos: "v", meaningKo: "분석하다", level: "B2", example: "We analyze the data carefully.", tags: ["verb"] },
  { word: "assume", pos: "v", meaningKo: "가정하다", level: "B2", example: "Do not assume anything.", tags: ["verb"] },
  { word: "estimate", pos: "v", meaningKo: "추정하다", level: "B2", example: "They estimated the cost.", tags: ["verb"] },
  { word: "justify", pos: "v", meaningKo: "정당화하다", level: "B2", example: "Can you justify your decision?", tags: ["verb"] },
  { word: "maintain", pos: "v", meaningKo: "유지하다", level: "B2", example: "We must maintain quality.", tags: ["verb"] },
  { word: "negotiate", pos: "v", meaningKo: "협상하다", level: "B2", example: "They negotiated a contract.", tags: ["verb"] },
  { word: "prioritize", pos: "v", meaningKo: "우선순위를 두다", level: "B2", example: "Prioritize the important tasks.", tags: ["verb"] },
  { word: "resolve", pos: "v", meaningKo: "해결하다", level: "B2", example: "We resolved the conflict.", tags: ["verb"] },
  { word: "transform", pos: "v", meaningKo: "변형/변환하다", level: "B2", example: "Technology can transform society.", tags: ["verb"] },
  { word: "utilize", pos: "v", meaningKo: "활용하다", level: "B2", example: "We utilize available resources.", tags: ["verb"] },

  { word: "approach", pos: "n", meaningKo: "접근법", level: "B2", example: "This approach works well.", tags: ["noun"] },
  { word: "constraint", pos: "n", meaningKo: "제약", level: "B2", example: "Time is a constraint.", tags: ["noun"] },
  { word: "framework", pos: "n", meaningKo: "프레임워크", level: "B2", example: "Next.js is a framework.", tags: ["noun"] },
  { word: "objective", pos: "n", meaningKo: "목표", level: "B2", example: "Our objective is clear.", tags: ["noun"] },
  { word: "outcome", pos: "n", meaningKo: "결과", level: "B2", example: "The outcome was positive.", tags: ["noun"] },

  { word: "efficient", pos: "adj", meaningKo: "효율적인", level: "B2", example: "This workflow is efficient.", tags: ["adj"] },
  { word: "significant", pos: "adj", meaningKo: "중요한/상당한", level: "B2", example: "There was significant progress.", tags: ["adj"] },
  { word: "subtle", pos: "adj", meaningKo: "미묘한", level: "B2", example: "There is a subtle difference.", tags: ["adj"] },
  { word: "accurate", pos: "adj", meaningKo: "정확한", level: "B2", example: "The information is accurate.", tags: ["adj"] },
  { word: "reliable", pos: "adj", meaningKo: "신뢰할 수 있는", level: "B2", example: "We need reliable results.", tags: ["adj"] },
];

const grammarTopics: GrammarSeed[] = [
  {
    title: "Be동사 현재형 (am/is/are)",
    level: "A1",
    ruleSummary: "I am, he/she/it is, you/we/they are 형태를 사용한다.",
    examples: ["I am tired.", "She is my friend.", "They are students."],
    commonMistakes: ["I is ...", "He are ...", "They is ..."],
  },
  {
    title: "일반동사 현재형 & 3인칭 단수 -s",
    level: "A1",
    ruleSummary: "현재형에서 he/she/it 주어면 동사에 -s/-es를 붙인다.",
    examples: ["I play soccer.", "He plays soccer.", "She watches TV."],
    commonMistakes: ["He play ...", "She watch ...", "I plays ..."],
  },
  {
    title: "현재진행 (be + V-ing)",
    level: "A1",
    ruleSummary: "지금 진행 중: am/is/are + 동사-ing",
    examples: ["I am studying.", "He is running.", "They are talking."],
    commonMistakes: ["I studying now.", "He is runing.", "They are talk."],
  },
  {
    title: "과거형 규칙/불규칙",
    level: "A2",
    ruleSummary: "과거: 규칙동사 -ed, 불규칙동사는 형태 암기(go→went).",
    examples: ["I visited my friend.", "He went home.", "We ate dinner."],
    commonMistakes: ["I goed ...", "He eated ...", "We visit yesterday."],
  },
  {
    title: "미래 표현 (will / be going to)",
    level: "A2",
    ruleSummary: "will: 즉흥/예측, be going to: 계획/근거 있는 예측",
    examples: ["I will call you.", "I am going to study tonight.", "It will rain soon."],
    commonMistakes: ["I going to ...", "He will goes ...", "I am go to ..."],
  },
  {
    title: "조동사 can/must/should",
    level: "A2",
    ruleSummary: "조동사 뒤 동사원형. can(가능), must(의무), should(조언)",
    examples: ["I can swim.", "You must wear a helmet.", "You should rest."],
    commonMistakes: ["He can swims.", "You must to go.", "She should goes."],
  },
  {
    title: "비교급/최상급",
    level: "A2",
    ruleSummary: "비교급: -er/more, 최상급: -est/most. than / the 사용 주의.",
    examples: ["This is bigger than that.", "She is more careful.", "He is the fastest."],
    commonMistakes: ["more bigger", "the more fast", "fastest than"],
  },
  {
    title: "가산/불가산 (much/many, a/an, some/any)",
    level: "A2",
    ruleSummary: "가산명사: many, a/an. 불가산명사: much. some/any는 둘 다 가능.",
    examples: ["How many books?", "How much water?", "Do you have any time?"],
    commonMistakes: ["many water", "much books", "a rice"],
  },
  {
    title: "to부정사 (to + 동사원형)",
    level: "B1",
    ruleSummary: "목적/계획/이유: to + 동사원형. want/plan/decide + to V.",
    examples: ["I want to learn English.", "She decided to leave.", "We plan to travel."],
    commonMistakes: ["to learning", "want learn", "decide for leave"],
  },
  {
    title: "동명사 (V-ing) 기초",
    level: "B1",
    ruleSummary: "enjoy/finish/avoid 등 뒤에는 동명사(V-ing)를 자주 쓴다.",
    examples: ["I enjoy reading.", "He finished writing.", "Avoid making mistakes."],
    commonMistakes: ["enjoy to read", "finish to write", "avoid to make"],
  },
  {
    title: "수동태 (be + p.p.)",
    level: "B1",
    ruleSummary: "행동의 대상 강조: be + 과거분사. by ~는 행위자.",
    examples: ["The door is closed.", "The cake was made by her.", "English is spoken here."],
    commonMistakes: ["is close", "was make", "spoken by is"],
  },
  {
    title: "관계대명사 who/which/that",
    level: "B1",
    ruleSummary: "명사를 뒤에서 수식: 사람 who, 사물 which, 둘 다 that 가능.",
    examples: ["The man who called me...", "The book which I bought...", "The thing that matters..."],
    commonMistakes: ["The man which...", "The book who...", "The thing what..."],
  },
  {
    title: "현재완료 (have/has + p.p.)",
    level: "B2",
    ruleSummary: "과거부터 지금까지 경험/결과: have/has + p.p. (ever/never/already/yet)",
    examples: ["I have visited Japan.", "She has already finished.", "Have you ever tried it?"],
    commonMistakes: ["I have went", "She has finish", "Did you ever tried?"],
  },
  {
    title: "조건문 (If 1,2형) 기초",
    level: "B2",
    ruleSummary: "If 1형: If + 현재, will. If 2형: If + 과거, would.",
    examples: ["If it rains, I will stay home.", "If I were rich, I would travel.", "If you study, you will improve."],
    commonMistakes: ["If I will go", "If I was rich (시험에서는 were 권장)", "If you studied, you will..."],
  },
  {
    title: "간접의문문 (Do you know + wh- ... ?)",
    level: "B2",
    ruleSummary: "간접의문문은 평서문 어순: Do you know where he lives?",
    examples: ["Do you know where he lives?", "I wonder what she wants.", "Tell me how you did it."],
    commonMistakes: ["where does he live", "what does she want (간접에서)", "how did you do it (간접에서)"],
  },
];

async function main() {
  // Clean tables for deterministic seed
  const prismaAny = prisma as PrismaClient & {
    attempt?: { deleteMany: () => Promise<unknown> };
  };
  if (prismaAny.attempt) {
    await prismaAny.attempt.deleteMany();
  }
  await prisma.word.deleteMany();
  await prisma.grammarTopic.deleteMany();

  await prisma.word.createMany({
    data: words.map(w => ({
      word: w.word,
      pos: w.pos,
      meaningKo: w.meaningKo,
      level: w.level,
      example: w.example,
      tagsJson: JSON.stringify(w.tags ?? []),
    })),
  });

  await prisma.grammarTopic.createMany({
    data: grammarTopics.map(g => ({
      title: g.title,
      level: g.level,
      ruleSummary: g.ruleSummary,
      examplesJson: JSON.stringify(g.examples),
      commonMistakesJson: JSON.stringify(g.commonMistakes),
    })),
  });

  console.log(`Seeded: words=${words.length}, grammarTopics=${grammarTopics.length}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
