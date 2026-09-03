import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses, users, lessons, quizzes, enrollments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      category: courses.category,
      level: courses.level,
      price: courses.price,
      rating: courses.rating,
      totalReviews: courses.totalReviews,
      totalStudents: courses.totalStudents,
      totalLessons: courses.totalLessons,
      isPublished: courses.isPublished,
      teacherId: courses.teacherId,
      teacherName: users.name,
      teacherImage: users.image,
      teacherBio: users.bio,
    })
    .from(courses)
    .innerJoin(users, eq(courses.teacherId, users.id))
    .where(eq(courses.id, id));

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const courseLessons = await db.select().from(lessons)
    .where(eq(lessons.courseId, id))
    .orderBy(lessons.order);

  const courseQuizzes = await db.select().from(quizzes)
    .where(eq(quizzes.courseId, id));

  let isEnrolled = false;
  let enrollment = null;
  if (session?.user?.id) {
    const [enr] = await db.select().from(enrollments)
      .where(eq(enrollments.userId, session.user.id))
      .where(eq(enrollments.courseId, id));
    isEnrolled = !!enr;
    enrollment = enr;
  }

  return NextResponse.json({ ...course, lessons: courseLessons, quizzes: courseQuizzes, isEnrolled, enrollment });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const [course] = await db.update(courses).set({
    title: body.title,
    description: body.description,
    category: body.category,
    level: body.level,
    price: Number(body.price),
    isPublished: body.isPublished,
  }).where(eq(courses.id, id)).returning();
  return NextResponse.json(course);
}