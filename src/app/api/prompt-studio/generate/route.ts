import { type NextRequest, NextResponse } from "next/server";
import {
  generateDollarDoodlesMetadata,
  generateDollarDoodlesScenes,
} from "@/lib/gemini-prompt-director";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "all", // "prompt2" | "prompt3" | "all"
      script = "",
      srtContent = "",
      aspectRatio = "16:9",
      projectNumber = "01",
      apiKey = "",
    } = body;

    const results: {
      prompt2?: Awaited<ReturnType<typeof generateDollarDoodlesScenes>>;
      prompt3?: Awaited<ReturnType<typeof generateDollarDoodlesMetadata>>;
    } = {};

    // Run Prompt 2 if requested
    if (action === "prompt2" || action === "all") {
      if (!srtContent?.trim() && !script?.trim()) {
        return NextResponse.json(
          {
            error:
              "Please provide either an .srt subtitle file or a video script for Scene Generation.",
          },
          { status: 400 },
        );
      }

      results.prompt2 = await generateDollarDoodlesScenes({
        script,
        srtContent,
        aspectRatio,
        projectNumber,
        apiKey,
      });
    }

    // Run Prompt 3 if requested
    if (action === "prompt3" || action === "all") {
      const scriptForMeta = script?.trim() || srtContent?.trim();
      if (!scriptForMeta) {
        return NextResponse.json(
          {
            error:
              "Please provide a video script or subtitles for Metadata Generation.",
          },
          { status: 400 },
        );
      }

      results.prompt3 = await generateDollarDoodlesMetadata({
        script: scriptForMeta,
        apiKey,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err: unknown) {
    console.error("Prompt Studio API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Generation failed" },
      { status: 500 },
    );
  }
}
