import { type NextRequest, NextResponse } from "next/server";

interface GeneratePayload {
  prompt: string;
  model: "nano-banana-pro" | "nano-banana-2.1" | "nano-banana-2-lite";
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3";
  sampleCount?: number;
  referenceImages?: Array<{
    mimeType: string;
    base64Data: string;
  }>;
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeneratePayload;
    const {
      prompt,
      model,
      aspectRatio = "1:1",
      sampleCount = 1,
      referenceImages = [],
      apiKey,
    } = body;

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
            "No Gemini API Key found. Please add your Gemini Pro API Key in the Nano Banana Studio settings or set GEMINI_API_KEY in your .env.local file.",
        },
        { status: 401 },
      );
    }

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt cannot be empty" },
        { status: 400 },
      );
    }

    // Dollar Doodles style enhancement prompt to ensure consistent character stickman aesthetic
    const styleKeywords =
      "Dollar Doodles style, minimalist stickman character, clean thick black ink strokes, white background or sticker cut-out border, red cap, red shirt, expressive doodle animation style, vector storyboard art";
    const fullPrompt = `${prompt.trim()}, ${styleKeywords}`;

    // 1. If Nano Banana Pro or Imagen-3 dedicated generation (without reference images)
    if (model === "nano-banana-pro" && referenceImages.length === 0) {
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${activeKey}`;

      const imagenRes = await fetch(imagenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: fullPrompt }],
          parameters: {
            sampleCount: Math.min(sampleCount, 4),
            aspectRatio: aspectRatio,
            personGeneration: "ALLOW_ADULT",
            outputMimeType: "image/png",
          },
        }),
      });

      if (!imagenRes.ok) {
        const errorText = await imagenRes.text();
        console.error("Imagen 3 API Error:", errorText);
        // If Imagen fails or requires different permission, fall through to multimodal Gemini
      } else {
        const data = await imagenRes.json();
        const predictions = data.predictions || [];
        if (predictions.length > 0) {
          const images = predictions.map(
            (p: { bytesBase64Encoded: string }) => ({
              url: `data:image/png;base64,${p.bytesBase64Encoded}`,
              width: aspectRatio === "16:9" ? 2048 : 1024,
              height: aspectRatio === "16:9" ? 1152 : 1024,
              isUpscaled2K: false,
            }),
          );

          return NextResponse.json({
            success: true,
            images,
            modelUsed: "imagen-3.0-generate-002 (Nano Banana Pro)",
          });
        }
      }
    }

    // 2. Multimodal Generation (Nano Banana 2.1 / Nano Banana Pro with Reference Images)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeKey}`;

    const parts: Array<Record<string, unknown>> = [];

    // Attach reference images for character turnaround / style conditioning
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

    parts.push({
      text:
        referenceImages.length > 0
          ? `Using the character design, red cap, red shirt, and line style from the attached reference image(s), generate a new storyboard illustration: ${prompt}. Maintain strict character consistency and doodle art style.`
          : fullPrompt,
    });

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini Multimodal API Error:", errBody);
      return NextResponse.json(
        {
          success: false,
          error: `Gemini API returned status ${geminiRes.status}: ${errBody.slice(0, 300)}`,
        },
        { status: geminiRes.status },
      );
    }

    const geminiData = await geminiRes.json();
    const candidateParts = geminiData?.candidates?.[0]?.content?.parts || [];

    const generatedImages: Array<{
      url: string;
      width: number;
      height: number;
      isUpscaled2K: boolean;
    }> = [];

    for (const part of candidateParts) {
      if (part.inlineData) {
        generatedImages.push({
          url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          width: 1024,
          height: 1024,
          isUpscaled2K: false,
        });
      }
    }

    if (generatedImages.length > 0) {
      return NextResponse.json({
        success: true,
        images: generatedImages,
        modelUsed:
          model === "nano-banana-2.1"
            ? "gemini-2.0-flash (Nano Banana 2.1 Multi-Ref)"
            : "gemini-2.0-flash (Nano Banana)",
      });
    }

    // If Gemini model only returned text (e.g. if image modalities are restricted on this key)
    const textPart = candidateParts.find(
      (p: { text?: string }) => p.text,
    )?.text;

    return NextResponse.json(
      {
        success: false,
        error:
          textPart ||
          "Gemini generated text instead of an image. Ensure your Gemini Pro API key has image generation enabled.",
      },
      { status: 422 },
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Nano Banana generation route exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 },
    );
  }
}
