import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessonProgress, enrollments, lessons, certificates } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId } = await params;
  const { lessonId } = await req.json();

  // Mark lesson complete
  const [existing] = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.userId, session.user.id), eq(lessonProgress.lessonId, lessonId)));

  if (!existing) {
    await db.insert(lessonProgress).values({
      userId: session.user.id,
      lessonId,
      courseId,
      isCompleted: true,
      completedAt: new Date(),
    });
  }

  // Calculate progress
  const allLessons = await db.select().from(lessons).where(eq(lessons.courseId, courseId));
  const completedLessons = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.userId, session.user.id), eq(lessonProgress.courseId, courseId), eq(lessonProgress.isCompleted, true)));

  const progress = Math.round((completedLessons.length / allLessons.length) * 100);
  const isCompleted = progress === 100;

  // Update enrollment
  await db.update(enrollments).set({
    progress,
    isCompleted,
    completedAt: isCompleted ? new Date() : null,
    certificateIssued: isCompleted,
  }).where(and(eq(enrollments.userId, session.user.id), eq(enrollments.courseId, courseId)));

  // Issue certificate if completed
  if (isCompleted) {
    const [certExisting] = await db.select().from(certificates)
      .where(and(eq(certificates.userId, session.user.id), eq(certificates.courseId, courseId)));

    if (!certExisting) {
      const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await db.insert(certificates).values({
        userId: session.user.id,
        courseId,
        certificateNumber: certNumber,
      });
    }
  }

  return NextResponse.json({ progress, isCompleted });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId } = await params;

  const completed = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.userId, session.user.id), eq(lessonProgress.courseId, courseId), eq(lessonProgress.isCompleted, true)));

  return NextResponse.json({ completedLessons: completed.map((l) => l.lessonId) });
}