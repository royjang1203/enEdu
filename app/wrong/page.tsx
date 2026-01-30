"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import { LevelFilter } from "@/components/level-filter";

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
  reviewState?: { nextReviewAt: string | null; isMastered: boolean } | null;
};

export default function WrongNotesPage() {
  const searchParams = useSearchParams();
  const [kind, setKind] = React.useState<(typeof TABS)[number]["value"]>("all");
  const [attempts, setAttempts] = React.useState<WrongAttempt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [masterySaving, setMasterySaving] = React.useState<Record<string, boolean>>({});

  const [deviceId, setDeviceId] = React.useState("");
  const level = searchParams.get("level") ?? "all";

  const loadAttempts = React.useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    const params = new URLSearchParams({ deviceId, kind });
    if (level !== "all") {
      params.set("level", level);
    }
    const response = await fetch(`/api/wrong?${params.toString()}`);
    const data = await response.json();
    setAttempts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [deviceId, kind, level]);

  React.useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
  }, []);

  React.useEffect(() => {
    if (!deviceId) return;
    loadAttempts();
  }, [deviceId, loadAttempts]);

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const updateMastery = async (attempt: WrongAttempt, isMastered: boolean) => {
    if (!deviceId) return;
    const key = `${attempt.kind}:${attempt.sourceId}`;
    setMasterySaving((prev) => ({ ...prev, [key]: true }));
    try {
      await fetch("/api/review/mastery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          kind: attempt.kind,
          sourceId: attempt.sourceId,
          isMastered,
        }),
      });
      setAttempts((prev) =>
        prev.map((item) =>
          item.id === attempt.id
            ? {
                ...item,
                reviewState: {
                  nextReviewAt: item.reviewState?.nextReviewAt ?? null,
                  isMastered,
                },
              }
            : item
        )
      );
    } finally {
      setMasterySaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Wrong Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <LevelFilter label="Level" />
          </div>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading wrong answers...</p>
              ) : attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No wrong attempts yet.</p>
              ) : (
                attempts.map((attempt) => {
                  const masteryKey = `${attempt.kind}:${attempt.sourceId}`;
                  const isMastered = attempt.reviewState?.isMastered ?? false;
                  const nextReview = formatDate(attempt.reviewState?.nextReviewAt);
                  const saving = masterySaving[masteryKey];
                  return (
                    <Card key={attempt.id} className="border bg-white">
                      <CardContent className="space-y-3 pt-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{attempt.kind}</Badge>
                          <Badge className="bg-white/70 text-foreground">{attempt.level}</Badge>
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
                        {nextReview ? (
                          <p className="text-xs text-muted-foreground">Next review: {nextReview}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateMastery(attempt, true)}
                            disabled={isMastered || saving}
                          >
                            Mark as Mastered
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateMastery(attempt, false)}
                            disabled={!isMastered || saving}
                          >
                            Unmaster
                          </Button>
                        </div>
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
