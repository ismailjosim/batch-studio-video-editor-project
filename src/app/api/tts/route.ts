import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "en" }: { text: string; lang?: string } =
      await req.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "No text provided for speech synthesis" },
        { status: 400 },
      );
    }

    // Split text into chunks at punctuation boundaries (max 180 chars per chunk)
    const sentences = text
      .replace(/([.?!])\s+/g, "$1|")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if (`${current} ${sentence}`.trim().length <= 180) {
        current = `${current} ${sentence}`.trim();
      } else {
        if (current) chunks.push(current);
        if (sentence.length <= 180) {
          current = sentence;
        } else {
          // Break long sentence by comma or words
          const words = sentence.split(" ");
          let sub = "";
          for (const w of words) {
            if (`${sub} ${w}`.trim().length <= 180) {
              sub = `${sub} ${w}`.trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          if (sub) current = sub;
        }
      }
    }
    if (current) chunks.push(current);

    // Fetch neural TTS audio for each chunk
    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const encoded = encodeURIComponent(chunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json(
        { error: "Could not generate speech audio" },
        { status: 502 },
      );
    }

    // Concatenate all audio segments
    const combinedAudio = Buffer.concat(audioBuffers);

    return new NextResponse(combinedAudio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": combinedAudio.length.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    console.error("TTS generation error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Speech synthesis failed" },
      { status: 500 },
    );
  }
}
