import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizzes, quizQuestions, quizAttempts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { answers, courseId } = await req.json();

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
  const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, id));

  let score = 0;
  const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0);

  const results = questions.map((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) score += (q.points || 1);
    return { questionId: q.id, question: q.question, correctAnswer: q.correctAnswer, userAnswer, isCorrect };
  });

  const percentage = Math.round((score / totalPoints) * 100);
  const isPassed = percentage >= (quiz.passingScore || 70);

  await db.insert(quizAttempts).values({
    userId: session.user.id,
    quizId: id,
    courseId,
    score: percentage,
    totalPoints,
    isPassed,
  });

  return NextResponse.json({ score: percentage, totalPoints, isPassed, passingScore: quiz.passingScore, results });
}