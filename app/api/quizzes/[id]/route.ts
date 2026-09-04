import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, quizQuestions, quizAttempts } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
  const questions = await db.select().from(quizQuestions)
    .where(eq(quizQuestions.quizId, id))
    .orderBy(quizQuestions.order);

  // Hide correct answers
  const safeQuestions = questions.map(({ correctAnswer, ...rest }) => rest);
  return NextResponse.json({ ...quiz, questions: safeQuestions });
}