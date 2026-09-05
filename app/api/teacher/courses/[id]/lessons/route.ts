import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, courses } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await db.select().from(lessons)
    .where(eq(lessons.courseId, id))
    .orderBy(asc(lessons.order));
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["teacher", "admin"].includes(session?.user?.role || ""))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await db.select().from(lessons).where(eq(lessons.courseId, id));

  const [lesson] = await db.insert(lessons).values({
    courseId: id,
    title: body.title,
    description: body.description || null,
    videoUrl: body.videoUrl || null,
    content: body.content || null,
    duration: Number(body.duration) || 0,
    order: existing.length + 1,
    isFree: body.isFree || false,
  }).returning();

  // Update course totalLessons
  await db.update(courses).set({ totalLessons: existing.length + 1 }).where(eq(courses.id, id));

  return NextResponse.json(lesson);
}