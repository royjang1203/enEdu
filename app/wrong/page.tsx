"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getOrCreateDeviceId } from "@/lib/deviceId";

const TABS = [
  { value: "all", label: "All" },
  { value: "vocab", label: "Vocab" },
  { value: "grammar", label: "Grammar" },
] as const;

type WrongAttempt = {
  id: string;
  kind: "vocab" | "grammar";
  questionId: string;
  sourceId: string;
  type: "mcq" | "blank";
  level: string;
  prompt: string;
  choices: string[];
  answer: string;
  chosen: string;
  explanation: string;
  createdAt: string;
};

type RetryState = {
  attemptId: string;
  userAnswer: string;
  isCorrect: boolean;
};

export default function WrongNotesPage() {
  const [kind, setKind] = React.useState<(typeof TABS)[number]["value"]>("all");
  const [attempts, setAttempts] = React.useState<WrongAttempt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [retryOpenId, setRetryOpenId] = React.useState<string | null>(null);
  const [retryInput, setRetryInput] = React.useState("");
  const [retryResult, setRetryResult] = React.useState<RetryState | null>(null);

  const [deviceId, setDeviceId] = React.useState("");

  const loadAttempts = React.useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    const response = await fetch(`/api/wrong?deviceId=${deviceId}&kind=${kind}`);
    const data = await response.json();
    setAttempts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [deviceId, kind]);

  React.useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
  }, []);

  React.useEffect(() => {
    if (!deviceId) return;
    loadAttempts();
  }, [deviceId, loadAttempts]);

  const saveAttempt = async (attempt: WrongAttempt, chosen: string, isCorrect: boolean) => {
    await fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        attempt: {
          kind: attempt.kind,
          questionId: attempt.questionId,
          sourceId: attempt.sourceId,
          type: attempt.type,
          level: attempt.level,
          prompt: attempt.prompt,
          choices: attempt.choices ?? [],
          answer: attempt.answer,
          chosen,
          isCorrect,
          explanation: attempt.explanation,
        },
      }),
    }).catch(() => null);
  };

  const onRetry = (attempt: WrongAttempt) => {
    setRetryOpenId(attempt.id);
    setRetryInput("");
    setRetryResult(null);
  };

  const submitRetry = async (attempt: WrongAttempt, chosen: string) => {
    const normalized = chosen.trim();
    const correct = attempt.answer.trim();
    const isCorrect = normalized.toLowerCase() === correct.toLowerCase();

    setRetryResult({
      attemptId: attempt.id,
      userAnswer: normalized,
      isCorrect,
    });

    await saveAttempt(attempt, normalized, isCorrect);
  };

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Wrong Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading wrong answers...</p>
              ) : attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No wrong attempts yet.</p>
              ) : (
                attempts.map((attempt) => {
                  const retryOpen = retryOpenId === attempt.id;
                  const retry = retryResult?.attemptId === attempt.id ? retryResult : null;
                  return (
                    <Card key={attempt.id} className="border bg-white">
                      <CardContent className="space-y-3 pt-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{attempt.kind}</Badge>
                          <Badge variant="secondary">{attempt.level}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(attempt.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{attempt.prompt}</p>
                        <p className="text-sm">
                          Your answer: <span className="font-semibold">{attempt.chosen}</span>
                        </p>
                        <p className="text-sm">
                          Correct answer: <span className="font-semibold">{attempt.answer}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{attempt.explanation}</p>
                        <Button variant="outline" onClick={() => onRetry(attempt)}>
                          Retry
                        </Button>

                        {retryOpen && (
                          <div className="rounded-lg border bg-muted/30 p-4">
                            {attempt.type === "mcq" ? (
                              <div className="grid gap-2">
                                {attempt.choices.map((choice) => (
                                  <Button
                                    key={choice}
                                    variant="outline"
                                    onClick={() => submitRetry(attempt, choice)}
                                    disabled={!!retry}
                                  >
                                    {choice}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <Input
                                  value={retryInput}
                                  onChange={(event) => setRetryInput(event.target.value)}
                                  placeholder="Type your answer"
                                  disabled={!!retry}
                                />
                                <Button
                                  onClick={() => submitRetry(attempt, retryInput)}
                                  disabled={!!retry}
                                >
                                  Submit
                                </Button>
                              </div>
                            )}

                            {retry && (
                              <p className={retry.isCorrect ? "text-emerald-600" : "text-rose-600"}>
                                {retry.isCorrect ? "Correct" : "Incorrect"}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
