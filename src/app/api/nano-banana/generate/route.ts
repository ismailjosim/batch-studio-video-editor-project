import { type NextRequest, NextResponse } from "next/server";
import { generateStudioDoodleSvg } from "@/lib/studio-doodle-generator";

interface GeneratePayload {
  prompt: string;
  model:
    | "flux-schnell"
    | "nano-banana-pro"
    | "nano-banana-2.1"
    | "nano-banana-2-lite";
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3";
  sampleCount?: number;
  referenceImages?: Array<{
    mimeType: string;
    base64Data: string;
  }>;
  apiKey?: string;
  useDemoFallback?: boolean;
}

const MODEL_NAME_MAP: Record<string, string> = {
  "nano-banana-2.1": "gemini-nano-banana-2.1",
  "nano-banana-pro": "gemini-3-pro-image",
  "nano-banana-2-lite": "gemini-3.1-flash-lite-image",
};

export async function GET() {
  const hasServerKey = Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY,
  );
  return NextResponse.json({ hasServerKey });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeneratePayload;
    const {
      prompt,
      model,
      aspectRatio = "1:1",
      sampleCount: _sampleCount = 1,
      referenceImages = [],
      apiKey,
      useDemoFallback = false,
    } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt cannot be empty" },
        { status: 400 },
      );
    }

    // If client requested demo mode directly
    if (useDemoFallback) {
      const doodleUrl = generateStudioDoodleSvg(prompt);
      return NextResponse.json({
        success: true,
        images: [
          {
            url: doodleUrl,
            width: 1024,
            height: 1024,
            isUpscaled2K: false,
          },
        ],
        modelUsed: "Studio Doodle Engine (Demo Mode)",
      });
    }

    // Free AI Generation via FLUX.1 Schnell (No API key or billing required!)
    if (model === "flux-schnell") {
      const width = aspectRatio === "16:9" ? 1280 : 1024;
      const height = aspectRatio === "16:9" ? 720 : 1024;
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(
        `Dollar Doodles style character, minimalist stickman, thick black ink line art, signature red cap, red shirt, cartoon vector illustration, clean white background: ${prompt.trim()}`,
      );
      const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;

      try {
        const fluxRes = await fetch(fluxUrl, {
          signal: AbortSignal.timeout(25000),
        });
        if (fluxRes.ok) {
          const buffer = await fluxRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          return NextResponse.json({
            success: true,
            images: [
              {
                url: `data:image/jpeg;base64,${base64}`,
                width,
                height,
                isUpscaled2K: false,
              },
            ],
            modelUsed: "FLUX.1 Schnell (Free Unlimited AI)",
          });
        }
      } catch (fluxErr) {
        console.warn(
          "Pollinations FLUX request failed, using studio doodle fallback:",
          fluxErr,
        );
        const doodleUrl = generateStudioDoodleSvg(prompt);
        return NextResponse.json({
          success: true,
          images: [{ url: doodleUrl, width, height, isUpscaled2K: false }],
          modelUsed: "Studio Doodle Engine (Fallback)",
        });
      }
    }

    const activeKey =
      apiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!activeKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Gemini API Key found. Please add your Gemini API Key in the Nano Banana Studio settings or set GEMINI_API_KEY in your .env.local file.",
        },
        { status: 401 },
      );
    }

    const targetModel = MODEL_NAME_MAP[model] || "gemini-nano-banana-2.1";
    const fullPrompt = `Dollar Doodles style character, minimalist stickman, thick black ink line art, signature red cap, red shirt, clean cartoon vector storyboard: ${prompt.trim()}`;

    // Prepare contents array for Gemini generateContent
    const parts: Array<Record<string, unknown>> = [];

    if (referenceImages && referenceImages.length > 0) {
      for (const ref of referenceImages) {
        const cleanBase64 = ref.base64Data.includes(",")
          ? ref.base64Data.split(",")[1]
          : ref.base64Data;

        parts.push({
          inlineData: {
            mimeType: ref.mimeType || "image/png",
            data: cleanBase64,
          },
        });
      }
    }

    parts.push({ text: fullPrompt });

    // Official Gemini API generateContent endpoint with responseModalities IMAGE
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
    });

    if (geminiRes.ok) {
      const geminiData = await geminiRes.json();
      const candidateParts = geminiData?.candidates?.[0]?.content?.parts || [];

      const generatedImages: Array<{
        url: string;
        width: number;
        height: number;
        isUpscaled2K: boolean;
      }> = [];

      for (const part of candidateParts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          generatedImages.push({
            url: `data:${mime};base64,${part.inlineData.data}`,
            width: aspectRatio === "16:9" ? 2048 : 1024,
            height: aspectRatio === "16:9" ? 1152 : 1024,
            isUpscaled2K: false,
          });
        }
      }

      if (generatedImages.length > 0) {
        return NextResponse.json({
          success: true,
          images: generatedImages,
          modelUsed: `${targetModel} (Live Gemini Pro)`,
        });
      }
    }

    // Handle Google API errors with specific diagnosis
    const errorData = await geminiRes.json().catch(() => null);
    const googleMsg = errorData?.error?.message || "";
    const isQuotaLimitZero =
      geminiRes.status === 429 ||
      googleMsg.includes("limit: 0") ||
      googleMsg.includes("Quota exceeded") ||
      googleMsg.includes("quota");

    if (isQuotaLimitZero) {
      return NextResponse.json(
        {
          success: false,
          isQuotaError: true,
          error:
            "Google Gemini Quota Limit: 0 (Billing Required). Google requires a linked Google Cloud Billing Account (Pay-As-You-Go) for image generation models like Gemini Nano Banana & Gemini 3 Pro. Free tier accounts have a limit of 0 image requests per day.",
          projectNumber: process.env.GEMINI_PROJECT_NUMBER || "349945349831",
          billingUrl: "https://console.cloud.google.com/billing",
          studioUrl: "https://aistudio.google.com/",
          demoAvailable: true,
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          googleMsg ||
          "Gemini API did not return image data. Verify your Gemini Pro API key has Generative Image access enabled.",
      },
      { status: geminiRes.status || 500 },
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Nano Banana generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 },
    );
  }
}
