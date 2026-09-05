import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allowedEmails } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await db.select().from(allowedEmails);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email, role } = await req.json();
  const [entry] = await db.insert(allowedEmails).values({ email, role }).returning().onConflictDoNothing();
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email } = await req.json();
  await db.delete(allowedEmails).where(eq(allowedEmails.email, email));
  return NextResponse.json({ success: true });
}