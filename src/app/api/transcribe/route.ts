import { type NextRequest, NextResponse } from "next/server";

interface WordItem {
  word: string;
  start: number; // in seconds
  end: number; // in seconds
}

interface SegmentItem {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WordItem[];
}

function formatSrtTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const totalMs = Math.round(safeSeconds * 1000);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string) || "sentence_srt";
    const engine = (formData.get("engine") as string) || "groq";
    const colabUrl = (formData.get("colabUrl") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    // 1. If user selected Colab/Gradio engine
    if (engine === "colab" && colabUrl.trim()) {
      try {
        const cleanUrl = colabUrl.trim().replace(/\/+$/, "");
        const gradioForm = new FormData();
        gradioForm.append("files", file);

        const uploadRes = await fetch(`${cleanUrl}/upload`, {
          method: "POST",
          body: gradioForm,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const filePath = Array.isArray(uploadData)
            ? uploadData[0]
            : uploadData;

          const predictRes = await fetch(`${cleanUrl}/api/predict/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: [
                filePath,
                format === "sentence_srt"
                  ? "Sentence SRT"
                  : format === "word_srt"
                    ? "Word by Word SRT"
                    : "TXT",
              ],
            }),
          });

          if (predictRes.ok) {
            const predictData = await predictRes.json();
            const textResult = predictData?.data?.[0] || "";
            return NextResponse.json({
              success: true,
              engine: "colab",
              format,
              textResult,
            });
          }
        }
      } catch (colabErr) {
        console.warn("Colab proxy fallback to Groq:", colabErr);
      }
    }

    // 2. Default Cloud Whisper Engine (Groq Whisper Large-v3)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is not configured in .env.local. Please check your environment variables.",
        },
        { status: 500 },
      );
    }

    const groqForm = new FormData();
    groqForm.append("file", file, file.name || "audio.wav");
    groqForm.append("model", "whisper-large-v3");
    groqForm.append("response_format", "verbose_json");
    groqForm.append("timestamp_granularities[]", "word");
    groqForm.append("timestamp_granularities[]", "segment");

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: groqForm,
      },
    );

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json(
        { error: `Groq Whisper API error: ${errText}` },
        { status: groqRes.status },
      );
    }

    const data = await groqRes.json();
    const rawText: string = data.text || "";
    const words: WordItem[] = (data.words || []).map(
      (w: { word: string; start: number; end: number }) => ({
        word: w.word.trim(),
        start: w.start,
        end: w.end,
      }),
    );
    const rawSegments: SegmentItem[] = data.segments || [];

    // Format results according to user choice:
    let outputText = "";
    interface FormattedCue {
      id: number;
      startMs: number;
      endMs: number;
      text: string;
      words: { word: string; startMs: number; endMs: number }[];
    }
    const formattedCues: FormattedCue[] = [];

    if (format === "txt") {
      outputText = rawText.trim();
    } else if (format === "word_srt") {
      // Word by Word SRT: each word is its own subtitle cue
      const srtBlocks: string[] = [];
      words.forEach((w, idx) => {
        const id = idx + 1;
        const startSec = Math.max(0, w.start);
        const endSec = Math.max(startSec + 0.1, w.end);
        const startMs = Math.round(startSec * 1000);
        const endMs = Math.round(endSec * 1000);

        srtBlocks.push(
          `${id}\n${formatSrtTime(startSec)} --> ${formatSrtTime(endSec)}\n${w.word}`,
        );

        formattedCues.push({
          id,
          startMs,
          endMs,
          text: w.word,
          words: [{ word: w.word, startMs, endMs }],
        });
      });
      outputText = srtBlocks.join("\n\n");
    } else {
      // Sentence SRT: Groups words into natural sentences ending with punctuation or segments
      const sentencePunctuation = /[.!?]$/;
      const sentenceGroups: { words: WordItem[] }[] = [];
      let currentSentenceWords: WordItem[] = [];

      if (words.length > 0) {
        words.forEach((w, idx) => {
          currentSentenceWords.push(w);
          const isPunctuation = sentencePunctuation.test(w.word);
          const isNextPause =
            idx < words.length - 1 && words[idx + 1].start - w.end >= 0.7;
          const isMaxWords = currentSentenceWords.length >= 14;

          if (
            isPunctuation ||
            isNextPause ||
            isMaxWords ||
            idx === words.length - 1
          ) {
            sentenceGroups.push({ words: [...currentSentenceWords] });
            currentSentenceWords = [];
          }
        });
      } else if (rawSegments.length > 0) {
        // Fallback to Whisper segments if words array is empty
        rawSegments.forEach((seg) => {
          sentenceGroups.push({
            words: [
              {
                word: seg.text.trim(),
                start: seg.start,
                end: seg.end,
              },
            ],
          });
        });
      }

      const srtBlocks: string[] = [];
      sentenceGroups.forEach((group, idx) => {
        if (group.words.length === 0) return;
        const id = idx + 1;
        const first = group.words[0];
        const last = group.words[group.words.length - 1];
        const startSec = Math.max(0, first.start);
        const endSec = Math.max(startSec + 0.25, last.end);
        const startMs = Math.round(startSec * 1000);
        const endMs = Math.round(endSec * 1000);
        const sentenceText = group.words.map((w) => w.word).join(" ");

        srtBlocks.push(
          `${id}\n${formatSrtTime(startSec)} --> ${formatSrtTime(endSec)}\n${sentenceText}`,
        );

        formattedCues.push({
          id,
          startMs,
          endMs,
          text: sentenceText,
          words: group.words.map((w) => ({
            word: w.word,
            startMs: Math.round(w.start * 1000),
            endMs: Math.round(w.end * 1000),
          })),
        });
      });
      outputText = srtBlocks.join("\n\n");
    }

    return NextResponse.json({
      success: true,
      engine: "groq",
      model: "whisper-large-v3",
      format,
      rawText,
      srtResult: outputText,
      cues: formattedCues,
      wordsCount: words.length,
      cuesCount: formattedCues.length,
      durationSec:
        data.duration || (words.length > 0 ? words[words.length - 1].end : 0),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Transcribe API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transcribe audio" },
      { status: 500 },
    );
  }
}
