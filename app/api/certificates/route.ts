import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { certificates, courses, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db
    .select({
      id: certificates.id,
      certificateNumber: certificates.certificateNumber,
      issuedAt: certificates.issuedAt,
      courseId: courses.id,
      courseTitle: courses.title,
      courseCategory: courses.category,
      teacherName: users.name,
    })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .innerJoin(users, eq(courses.teacherId, users.id))
    .where(eq(certificates.userId, session.user.id));

  return NextResponse.json(data);
}