import Link from "next/link";
import { prisma } from "@/lib/db";
import { LevelFilter } from "@/components/level-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function VocabPage({
  searchParams,
}: {
  searchParams: { level?: string };
}) {
  const level = searchParams.level && searchParams.level !== "all" ? searchParams.level : undefined;
  const words = await prisma.word.findMany({
    where: level ? { level } : undefined,
    orderBy: [{ level: "asc" }, { word: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Vocabulary</h2>
          <p className="text-muted-foreground">
            Browse curated vocabulary with meanings and examples.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LevelFilter label="Level" />
          <Link
            href="/vocab/test"
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
        {words.map((word) => (
          <Card key={word.id} className="bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">
                  <Link href={`/vocab/${word.id}`} className="hover:underline">
                    {word.word}
                  </Link>
                </CardTitle>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge>{word.level}</Badge>
                  <span>{word.pos}</span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{word.meaningKo}</span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Example: {word.exampleEn}</p>
              {word.exampleKo ? (
                <p className="mt-1 text-xs text-muted-foreground/80">{word.exampleKo}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
