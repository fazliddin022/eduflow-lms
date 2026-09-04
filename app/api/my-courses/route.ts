import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enrollments, courses, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db
    .select({
      id: enrollments.id,
      progress: enrollments.progress,
      isCompleted: enrollments.isCompleted,
      enrolledAt: enrollments.enrolledAt,
      courseId: courses.id,
      courseTitle: courses.title,
      courseCategory: courses.category,
      courseLevel: courses.level,
      totalLessons: courses.totalLessons,
      teacherName: users.name,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(courses.teacherId, users.id))
    .where(eq(enrollments.userId, session.user.id))
    .orderBy(desc(enrollments.enrolledAt));

  return NextResponse.json(data);
}