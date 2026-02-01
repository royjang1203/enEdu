import Link from "next/link";
import { prisma } from "@/lib/db";
import { LevelFilter } from "@/components/level-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function GrammarPage({
  searchParams,
}: {
  searchParams: { level?: string };
}) {
  const level = searchParams.level && searchParams.level !== "all" ? searchParams.level : undefined;
  const topics = await prisma.grammarTopic.findMany({
    where: level ? { level } : undefined,
    orderBy: [{ level: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Grammar</h2>
          <p className="text-muted-foreground">
            Review essential grammar rules and examples.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LevelFilter label="Level" levels={["all", "Level1", "Level2", "Level3", "Level4"]} />
          <Link
            href="/grammar/test"
            className="rounded-md border border-input px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Take Test
          </Link>
          <Link
            href="/wrong"
            className="rounded-md border border-input px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Wrong Notes
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {topics.map((topic) => (
          <Card key={topic.id} className="bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">
                  <Link href={`/grammar/${topic.id}`} className="hover:underline">
                    {topic.title}
                  </Link>
                </CardTitle>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge>{topic.level}</Badge>
                  <Badge>Grade {topic.grade}</Badge>
                  <span>{topic.ruleSummary}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click to see examples and common mistakes.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
