import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enrollments, courses } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [existing] = await db.select().from(enrollments)
    .where(and(eq(enrollments.userId, session.user.id), eq(enrollments.courseId, id)));

  if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 400 });

  const [enrollment] = await db.insert(enrollments).values({
    userId: session.user.id,
    courseId: id,
    progress: 0,
  }).returning();

  await db.update(courses).set({
    totalStudents: (await db.select().from(courses).where(eq(courses.id, id)))[0].totalStudents! + 1,
  }).where(eq(courses.id, id));

  return NextResponse.json(enrollment);
}