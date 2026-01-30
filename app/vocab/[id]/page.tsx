import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const word = await prisma.word.findUnique({ where: { id: params.id } });
  if (!word) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/vocab" className="text-sm text-muted-foreground hover:text-foreground">
        ? Back to Vocabulary
      </Link>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle className="text-3xl">{word.word}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge>{word.level}</Badge>
            <span>{word.pos}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Meaning (KO)</p>
            <p className="text-lg">{word.meaningKo}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Example</p>
            <p className="text-muted-foreground">{word.example}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
