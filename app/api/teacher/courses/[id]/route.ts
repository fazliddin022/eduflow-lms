import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["teacher", "admin"].includes(session?.user?.role || ""))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [course] = await db.update(courses).set({
    title: body.title,
    description: body.description || null,
    category: body.category,
    level: body.level,
    price: Number(body.price) || 0,
  }).where(eq(courses.id, id)).returning();

  return NextResponse.json(course);
}