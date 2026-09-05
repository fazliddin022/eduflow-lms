import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses, enrollments } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!["teacher", "admin"].includes(session?.user?.role || ""))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.select().from(courses)
    .where(eq(courses.teacherId, session!.user.id))
    .orderBy(desc(courses.createdAt));

  return NextResponse.json(data);
}