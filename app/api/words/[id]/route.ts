import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const word = await prisma.word.findUnique({ where: { id: params.id } });
  if (!word) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(word);
}
