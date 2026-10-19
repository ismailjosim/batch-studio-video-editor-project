import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VideoProject } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const query = session?.user?.id ? { userId: session.user.id } : {};
    const projects = await VideoProject.find(query)
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, projects });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const body = await req.json();
    const projectData = {
      ...body,
      userId: session?.user?.id || undefined,
    };

    const project = await VideoProject.create(projectData);

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save project" },
      { status: 500 },
    );
  }
}
