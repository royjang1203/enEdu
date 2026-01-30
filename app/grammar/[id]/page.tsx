import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GrammarDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const topic = await prisma.grammarTopic.findUnique({ where: { id: params.id } });
  if (!topic) {
    notFound();
  }

  const examples = JSON.parse(topic.examplesJson) as string[];
  const mistakes = JSON.parse(topic.commonMistakesJson) as string[];

  return (
    <div className="space-y-6">
      <Link href="/grammar" className="text-sm text-muted-foreground hover:text-foreground">
        ? Back to Grammar
      </Link>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle className="text-3xl">{topic.title}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge>{topic.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Rule Summary</p>
            <p className="text-muted-foreground">{topic.ruleSummary}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Examples</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              {examples.map((example, index) => (
                <li key={index}>{example}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Common Mistakes</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              {mistakes.map((mistake, index) => (
                <li key={index}>{mistake}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
