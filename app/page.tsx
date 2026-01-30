import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border bg-white/70 p-10 shadow-sm backdrop-blur">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Focused learning
          </p>
          <h1 className="text-[2.5rem] font-semibold leading-[140%]">
            레벨별 어휘와 문법을 학습하고, 꾸준한 연습으로 영어 실력을 높여보세요.
          </h1>
          <p className="text-muted-foreground">
            Learn vocabulary and grammar by level. Practice smart, build consistency, and improve
            your English.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Vocabulary</CardTitle>
            <CardDescription>120 curated words across A1 to B2.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Study meaning, part of speech, and example usage.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/vocab">Go to Vocabulary</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/vocab/test">Take Vocab Test</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/vocab/test?mode=reviewWrong">Review Wrong</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Grammar</CardTitle>
            <CardDescription>15 essential grammar topics with examples.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review rule summaries, examples, and common mistakes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/grammar">Go to Grammar</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/grammar/test">Take Grammar Test</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/grammar/test?mode=reviewWrong">Review Wrong</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 md:col-span-2">
          <CardHeader>
            <CardTitle>Wrong Notes</CardTitle>
            <CardDescription>Review incorrect answers and retry.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track mistakes from vocab and grammar tests and practice again.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/wrong">Open Wrong Notes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
