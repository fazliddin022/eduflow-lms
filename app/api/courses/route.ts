import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const search = searchParams.get("search") || "";

  let data = await db
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
      createdAt: courses.createdAt,
    })
    .from(courses)
    .innerJoin(users, eq(courses.teacherId, users.id))
    .where(eq(courses.isPublished, true))
    .orderBy(desc(courses.totalStudents));

  if (category) data = data.filter((c) => c.category === category);
  if (level) data = data.filter((c) => c.level === level);
  if (search) data = data.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["admin", "teacher"].includes(session.user.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const [course] = await db.insert(courses).values({
    teacherId: session.user.id,
    title: body.title,
    description: body.description || null,
    category: body.category,
    level: body.level || "beginner",
    price: Number(body.price) || 0,
    isPublished: false,
  }).returning();
  return NextResponse.json(course);
}