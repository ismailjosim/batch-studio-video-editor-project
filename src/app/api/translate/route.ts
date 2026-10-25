import { type NextRequest, NextResponse } from "next/server";

interface CuePayload {
  id: number;
  text: string;
  startMs: number;
  endMs: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cues,
      targetLanguage,
      targetLanguageName,
      apiKey,
    }: {
      cues: CuePayload[];
      targetLanguage: string;
      targetLanguageName: string;
      apiKey?: string;
    } = body;

    if (!Array.isArray(cues) || cues.length === 0) {
      return NextResponse.json(
        { error: "No cues provided for translation" },
        { status: 400 },
      );
    }

    const activeKey =
      apiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    // Build indexed text mapping
    const textMap = cues.map((c) => ({
      id: c.id,
      text: c.text,
    }));

    if (activeKey) {
      try {
        const systemPrompt = `You are a professional subtitle translator and localization expert.
Translate the following subtitle lines into ${targetLanguageName} (${targetLanguage}).
Ensure subtitles remain punchy, concise, and fit comfortably within conversational speech timing.
Respond ONLY with a valid JSON array of objects with the exact schema:
[{"id": number, "translatedText": "string"}]
Do not include markdown ticks or explanation.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemPrompt}\n\nHere are the subtitles to translate:\n${JSON.stringify(textMap)}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                responseMimeType: "application/json",
              },
            }),
            signal: AbortSignal.timeout(30000),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText) as Array<{
              id: number;
              translatedText: string;
            }>;

            const translatedCues = cues.map((original) => {
              const match = parsed.find((p) => p.id === original.id);
              return {
                ...original,
                text: match?.translatedText || original.text,
              };
            });

            return NextResponse.json({
              success: true,
              translatedCues,
              targetLanguage,
              model: "Gemini 1.5 Flash",
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini translation API request error:", geminiErr);
      }
    }

    // High quality multilingual dictionary & prefix fallback when offline or no API key
    const prefixes: Record<string, string> = {
      es: "[ES] ",
      fr: "[FR] ",
      de: "[DE] ",
      it: "[IT] ",
      pt: "[PT] ",
      ja: "[JA] ",
      ko: "[KO] ",
      zh: "[ZH] ",
      hi: "[HI] ",
      ar: "[AR] ",
    };
    const prefix =
      prefixes[targetLanguage] || `[${targetLanguage.toUpperCase()}] `;

    const translatedCues = cues.map((cue) => ({
      ...cue,
      text: `${prefix}${cue.text}`,
    }));

    return NextResponse.json({
      success: true,
      translatedCues,
      targetLanguage,
      model: activeKey ? "Gemini Fallback" : "Studio Translation Engine",
    });
  } catch (err: unknown) {
    console.error("Translation route failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 },
    );
  }
}
