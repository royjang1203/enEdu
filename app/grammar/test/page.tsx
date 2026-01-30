"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import { CheckCircle2, XCircle } from "lucide-react";

const LEVELS = ["all", "A1", "A2", "B1", "B2"] as const;

type GrammarQuestion = {
  id: string;
  kind: "grammar";
  type: "mcq" | "blank";
  level: string;
  prompt: string;
  choices?: string[];
  answer: string;
  explanation: string;
  source: { grammarId: string; title: string };
};

type AnswerState = {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
};

export default function GrammarTestPage() {
  const [level, setLevel] = React.useState("all");
  const [started, setStarted] = React.useState(false);
  const [questions, setQuestions] = React.useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [inputAnswer, setInputAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState<AnswerState[]>([]);
  const [feedback, setFeedback] = React.useState<AnswerState | null>(null);
  const [loading, setLoading] = React.useState(false);
  const choiceRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const current = questions[currentIndex];
  const progress = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  const startTest = async () => {
    setLoading(true);
    setStarted(false);
    setAnswers([]);
    setCurrentIndex(0);
    setFeedback(null);
    setInputAnswer("");

    const response = await fetch("/api/test/grammar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: level === "all" ? undefined : level }),
    });
    const data = await response.json();
    setQuestions(data.questions ?? []);
    setStarted(true);
    setLoading(false);
  };

  const submitAnswer = async (value: string) => {
    if (!current) return;
    const normalized = value.trim();
    const correct = current.answer.trim();
    const isCorrect = normalized.toLowerCase() === correct.toLowerCase();

    const result = {
      questionId: current.id,
      userAnswer: normalized,
      isCorrect,
    };
    setFeedback(result);
    setAnswers((prev) => [...prev, result]);

    const deviceId = getOrCreateDeviceId();
    fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        attempt: {
          kind: "grammar",
          questionId: current.id,
          sourceId: current.source.grammarId,
          type: current.type,
          level: current.level,
          prompt: current.prompt,
          choices: current.choices ?? [],
          answer: current.answer,
          chosen: normalized,
          isCorrect,
          explanation: current.explanation,
        },
      }),
    }).catch(() => null);
  };

  const goNext = () => {
    setFeedback(null);
    setInputAnswer("");
    setCurrentIndex((prev) => prev + 1);
  };

  React.useEffect(() => {
    if (!feedback) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [feedback]);

  const reset = () => {
    setStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setInputAnswer("");
    setAnswers([]);
    setFeedback(null);
  };

  const score = answers.filter((a) => a.isCorrect).length;

  if (!started) {
    return (
      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>Grammar Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Choose a level</p>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item === "all" ? "All" : item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startTest} disabled={loading}>
            {loading ? "Preparing..." : "Start Test"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return (
      <div className="relative">
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Grammar Test</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Test finished. Review your results in the summary.
          </CardContent>
        </Card>

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader>
              <CardTitle>Test Completed</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[75vh] space-y-6 overflow-y-auto">
              <div className="flex items-center gap-3">
                <Badge>Score</Badge>
                <span className="text-2xl font-semibold">
                  {score} / {questions.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                You answered {score} out of {questions.length} questions correctly.
              </p>
              <div className="space-y-3">
                {questions.map((question) => {
                  const answer = answers.find((a) => a.questionId === question.id);
                  return (
                    <Card key={question.id} className="border bg-white">
                      <CardContent className="space-y-2 pt-6">
                        <div className="flex items-start gap-2">
                          {answer?.isCorrect ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                          )}
                          <p className="text-sm text-muted-foreground">{question.prompt}</p>
                        </div>
                        <p className="text-sm">
                          Your answer: <span className="font-semibold">{answer?.userAnswer ?? "-"}</span>
                        </p>
                        <p className="text-sm">
                          Correct answer: <span className="font-semibold">{question.answer}</span>
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={reset}>Back to Level Select</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/80">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Grammar Test</CardTitle>
          <Badge>{currentIndex + 1} / {questions.length}</Badge>
        </div>
        <Progress value={progress} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{current.prompt}</p>
          {current.type === "mcq" && current.choices && (
            <div
              className="grid gap-2"
              onKeyDown={(event) => {
                if (!current.choices) return;
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                event.preventDefault();
                const activeIndex = choiceRefs.current.findIndex(
                  (el) => el === document.activeElement
                );
                const lastIndex = current.choices.length - 1;
                const nextIndex =
                  event.key === "ArrowDown"
                    ? activeIndex >= lastIndex || activeIndex === -1
                      ? 0
                      : activeIndex + 1
                    : activeIndex <= 0
                    ? lastIndex
                    : activeIndex - 1;
                choiceRefs.current[nextIndex]?.focus();
              }}
            >
              {current.choices.map((choice, index) => (
                <Button
                  key={choice}
                  variant="outline"
                  onClick={() => submitAnswer(choice)}
                  disabled={!!feedback}
                  ref={(el) => {
                    choiceRefs.current[index] = el;
                  }}
                >
                  {choice}
                </Button>
              ))}
            </div>
          )}
          {current.type === "blank" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={inputAnswer}
                onChange={(event) => setInputAnswer(event.target.value)}
                placeholder="Type your answer"
                disabled={!!feedback}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !feedback) {
                    event.preventDefault();
                    submitAnswer(inputAnswer);
                  }
                }}
              />
              <Button onClick={() => submitAnswer(inputAnswer)} disabled={!!feedback}>
                Submit
              </Button>
            </div>
          )}
        </div>

        {feedback && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className={feedback.isCorrect ? "text-emerald-600" : "text-rose-600"}>
              {feedback.isCorrect ? "Correct" : "Incorrect"}
            </p>
            <p className="text-sm text-muted-foreground">{current.explanation}</p>
            <Button className="mt-3" onClick={goNext}>
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
