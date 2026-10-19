import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { GenerationHistory, VideoProject } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const userQuery = session?.user?.id ? { userId: session.user.id } : {};

    const [totalProjects, totalRenders, recentProjects, recentRenders] =
      await Promise.all([
        VideoProject.countDocuments(userQuery),
        GenerationHistory.countDocuments({
          ...userQuery,
          status: "completed",
        }),
        VideoProject.find(userQuery)
          .sort({ updatedAt: -1 })
          .limit(4)
          .select(
            "title resolution aspectRatio cuesCount imagesCount updatedAt",
          )
          .lean(),
        GenerationHistory.find({ ...userQuery, status: "completed" })
          .sort({ createdAt: -1 })
          .limit(4)
          .select("title resolution durationSec fileSizeBytes createdAt")
          .lean(),
      ]);

    const hasGeminiKey = Boolean(
      process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_AI_KEY,
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects,
        totalRenders,
        hasGeminiKey,
        dbConnected: true,
      },
      recentProjects,
      recentRenders,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/overview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load overview data",
      },
      { status: 500 },
    );
  }
}
