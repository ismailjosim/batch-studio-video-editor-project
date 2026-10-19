import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { GenerationHistory } from "@/lib/models";

export async function GET(req: NextRequest) {
  if (!process.env.DB_URL && !process.env.MONGODB_URI) {
    return NextResponse.json({ success: true, history: [] });
  }

  try {
    await connectDB();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const query = session?.user?.id ? { userId: session.user.id } : {};
    const history = await GenerationHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ success: true, history });
  } catch (err: unknown) {
    const error = err as Error & { digest?: string };
    if (error?.digest?.startsWith("NEXT_")) {
      throw error;
    }
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch history" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.DB_URL && !process.env.MONGODB_URI) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Database not configured. Please define DB_URL in your Vercel Environment Variables.",
      },
      { status: 503 },
    );
  }

  try {
    await connectDB();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const body = await req.json();
    const historyRecord = await GenerationHistory.create({
      ...body,
      userId: session?.user?.id || undefined,
    });

    return NextResponse.json(
      { success: true, history: historyRecord },
      { status: 201 },
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record history" },
      { status: 500 },
    );
  }
}
