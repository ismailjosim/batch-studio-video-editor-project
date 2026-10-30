/**
 * Dollar Doodles AI Director Engine (Prompts 2 & 3)
 * Implements Prompt-2-Scene-Generation and Prompt-3-Metadata
 * Powered by Google Gemini API
 */

export interface ScenePromptItem {
  id: number;
  cameraAngle: string;
  description: string;
  fullPrompt: string;
}

export interface Prompt2Result {
  styleContent: string;
  scenePromptsContent: string;
  scenes: ScenePromptItem[];
  renamingInstruction: string;
  totalScenes: number;
  modelUsed: string;
}

export interface MetadataResult {
  titles: string[];
  description: string;
  tags: string[];
  thumbnailPrompts: {
    type: string;
    prompt: string;
  }[];
  rawContent: string;
  modelUsed: string;
}

export interface SrtEntry {
  index: number;
  timeRange: string;
  text: string;
}

/**
 * Parses raw SRT content into structured entries
 */
export function parseSrt(srtContent: string): SrtEntry[] {
  if (!srtContent || !srtContent.trim()) return [];

  const rawBlocks = srtContent.trim().split(/\r?\n\s*\r?\n/);
  const entries: SrtEntry[] = [];

  for (const block of rawBlocks) {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length >= 2) {
      let entryIndex = entries.length + 1;
      let timeRange = "";
      let textLines: string[] = [];

      if (/^\d+$/.test(lines[0])) {
        entryIndex = Number.parseInt(lines[0], 10);
        timeRange = lines[1] || "";
        textLines = lines.slice(2);
      } else if (lines[0].includes("-->")) {
        timeRange = lines[0];
        textLines = lines.slice(1);
      } else {
        textLines = lines;
      }

      const text = textLines.join(" ").replace(/\s+/g, " ").trim();
      if (text) {
        entries.push({
          index: entryIndex,
          timeRange,
          text,
        });
      }
    }
  }

  return entries;
}

/**
 * Helper to call Gemini with automatic model fallback
 */
async function callGeminiApi(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
): Promise<{ text: string; model: string }> {
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash-lite",
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n---\n\n${userMessage}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return { text: candidate.trim(), model };
        }
      } else {
        const errText = await response.text();
        console.warn(
          `Gemini ${model} returned error status:`,
          response.status,
          errText,
        );
        lastError = new Error(
          `Gemini ${model} error (${response.status}): ${errText}`,
        );
      }
    } catch (err: unknown) {
      lastError = err as Error;
      console.warn(
        `Gemini ${model} failed, trying next model:`,
        (err as Error).message,
      );
    }
  }

  throw (
    lastError ||
    new Error("All Gemini model endpoints failed to generate a response.")
  );
}

/**
 * GENERATE PROMPT 2: Style & Scene Prompts
 */
export async function generateDollarDoodlesScenes({
  script,
  srtContent,
  aspectRatio = "16:9",
  projectNumber = "01",
  apiKey,
}: {
  script?: string;
  srtContent?: string;
  aspectRatio?: "16:9" | "9:16";
  projectNumber?: string | number;
  apiKey?: string;
}): Promise<Prompt2Result> {
  const activeKey =
    apiKey?.trim() ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!activeKey) {
    throw new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in .env.local or enter it in the studio.",
    );
  }

  // Parse SRT or create sentences from script
  let subtitleItems: string[] = [];
  if (srtContent?.trim()) {
    const parsed = parseSrt(srtContent);
    subtitleItems = parsed.map((p) => p.text);
  }

  if (subtitleItems.length === 0 && script?.trim()) {
    // Split script by sentences
    subtitleItems = script
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
  }

  if (subtitleItems.length === 0) {
    throw new Error(
      "Please provide either a valid .srt subtitle file or a video script.",
    );
  }

  const paddedProjectNum = String(projectNumber).padStart(2, "0");
  const aspectLabel =
    aspectRatio === "9:16" ? "9:16 vertical" : "16:9 horizontal";

  // System Prompt strictly adhering to Prompt-2-Scene-Generation.md
  const systemPrompt = `You are the SCENE IMAGE PROMPT DIRECTOR for Dollar Doodles — a 2D Stickman Financial World YouTube explainer channel (Google Flow Single-Image Edition).

Your job is to read the provided video script/subtitles and generate TWO clean sections:
1. STYLE RULES:
- Aspect ratio: ${aspectLabel}
- Background: solid deep charcoal (#1a1a1a) edge-to-edge
- Palette: Crimson Red (#C8252B) for character accents/losses/danger/debt traps, Dollar Green (#3DAA72) for money/gain, Pure White (#FFFFFF) body fill with bold black outlines
- Define 3 to 5 recurring objects matching the script narrative (e.g. contracts, vaults, ledgers, ships, checks, etc.)
- Mascot: "the mascot" is the Dollar Doodles stickman with round white head, bold black outlines, white stick body, red backwards snapback cap and red hoodie, deadpan/street-smart expression.
- CRITICAL NO-SUBTITLE RULE: Absolutely NO subtitles, captions, lower-third bars, or speech bubbles in artwork.

2. SCENE PROMPTS:
- Every subtitle sentence becomes EXACTLY ONE image prompt: "image N: [Camera angle]. [Visual scene description]. [Optional Text: \\"WORD\\" in color]."
- CAMERA ANGLES: Must start each prompt with a valid camera angle (Eye-level frontal shot, Medium shot, Wide shot, Profile shot, Low-angle shot, High-angle shot, Dutch-angle (tilted) shot, Top-down shot, Extreme close-up, Macro detail shot, Over-the-shoulder shot, Behind-the-character shot).
- DIVERSITY: Never use the same camera angle on two consecutive images. Rotate through at least 5 different angles every 10 images.
- TEXT INSIDE IMAGES: Optional. If included, MUST be in ALL CAPS in quotes, 1 to 4 words (e.g. Text: "DEBT TRAP" in red, Text: "$10B TOLL" in green, Text: "WHY?" in white). Text must only be placed on mild, readable angles (Eye-level frontal shot, Medium shot, or Low-angle shot).
- NO STORYBOARDS OR BATCH GRIDS: Single standalone image prompts only.

OUTPUT FORMAT:
Provide the output in two clearly separated blocks:
=== STYLE RULES ===
[Content for 02-Style.txt]
=== SCENE PROMPTS ===
image 1: ...
image 2: ...
...
image N: ...`;

  // We can process in batches if sentence count is very large (> 120 sentences) to prevent token truncation
  const BATCH_SIZE = 70;
  const totalSubtitles = subtitleItems.length;

  let styleRulesContent = "";
  const allScenePrompts: string[] = [];
  let modelUsedFinal = "gemini-3.5-flash";

  if (totalSubtitles <= BATCH_SIZE) {
    const userPrompt = `Script Summary & Context:\n${(script || subtitleItems.slice(0, 30).join(" ")).slice(0, 1500)}\n\nSubtitles to convert (${totalSubtitles} total):\n${subtitleItems.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}`;
    const result = await callGeminiApi(systemPrompt, userPrompt, activeKey);
    modelUsedFinal = result.model;

    const parts = result.text.split(/===\s*SCENE PROMPTS\s*===/i);
    if (parts.length >= 2) {
      styleRulesContent = parts[0]
        .replace(/===\s*STYLE RULES\s*===/i, "")
        .trim();
      const promptLines = parts[1]
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => /^image\s+\d+:/i.test(l));
      allScenePrompts.push(...promptLines);
    } else {
      // Fallback parse
      const lines = result.text.split(/\r?\n/);
      for (const line of lines) {
        if (/^image\s+\d+:/i.test(line)) {
          allScenePrompts.push(line.trim());
        }
      }
      styleRulesContent = result.text.split(/^image\s+1:/im)[0]?.trim() || "";
    }
  } else {
    // Multi-batch for long videos (like 14-minute 380 subtitles video)
    // Step 1: Generate style rules from the first batch
    const firstBatchText = subtitleItems.slice(0, 40).join("\n");
    const stylePromptReq = `Generate ONLY the === STYLE RULES === for this video script:\n\n${(script || firstBatchText).slice(0, 2000)}`;
    const styleResult = await callGeminiApi(
      systemPrompt,
      stylePromptReq,
      activeKey,
    );
    modelUsedFinal = styleResult.model;
    styleRulesContent = styleResult.text
      .replace(/===\s*STYLE RULES\s*===/i, "")
      .replace(/===\s*SCENE PROMPTS\s*===[\s\S]*/i, "")
      .trim();

    // Step 2: Generate scene prompts in sequential batches
    for (let i = 0; i < totalSubtitles; i += BATCH_SIZE) {
      const slice = subtitleItems.slice(i, i + BATCH_SIZE);
      const startIdx = i + 1;
      const batchList = slice
        .map((text, idx) => `${startIdx + idx}. ${text}`)
        .join("\n");
      const batchPrompt = `Generate ONLY SCENE PROMPTS for items ${startIdx} to ${startIdx + slice.length - 1}.
Every single item must produce exactly one prompt: 'image N: [Camera angle]. [Visual scene description]'.
Maintain strict camera angle rotation and brand palette.
Do not output style rules or headings.

Items:\n${batchList}`;

      try {
        const batchRes = await callGeminiApi(
          systemPrompt,
          batchPrompt,
          activeKey,
        );
        const batchLines = batchRes.text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => /^image\s+\d+:/i.test(l));
        allScenePrompts.push(...batchLines);
      } catch (batchErr) {
        console.warn(`Batch ${startIdx} failed:`, batchErr);
      }
    }
  }

  // Ensure default style if empty
  if (!styleRulesContent || styleRulesContent.length < 50) {
    styleRulesContent = `Create a clean 2D stickman financial illustration with ${aspectLabel} aspect ratio.

STYLE & BRAND RULES:
Strictly follow the brand logo color palette and reference image: solid deep charcoal background (#1a1a1a) edge-to-edge, character accents and financial loss/danger cues in Crimson Red (#C8252B), money and financial gains in Dollar Green (#3DAA72), and stick figures in solid white fill with bold black outlines. Neutral labels, papers, receipts, and charts in light grey / pure white (#E0E0E0 / #FFFFFF) with black outlines. Maintain absolute color palette, line weight, and character consistency across every single image from first to last. Style is a hand-drawn 2D sticker-style illustration with visible sketch lines, bold outlines, and white cut-out halos around characters and key objects. The character design must stay identical in every image regardless of camera angle; only the perspective changes. Never add sentence numbers, timestamps, watermarks, or labels inside the artwork.

CRITICAL NO-SUBTITLE RULE:
Absolutely NO subtitles, NO captions, NO lower-third text bars, NO speech bubbles, and NO narration transcriptions at the bottom of any frame. The image artwork must remain completely clean of subtitles. Any text shown in an image must be spelled exactly as written in quotes in that image's description.

Recurring objects (identical in every image where they appear):
- "the canal waterway": A stylized trench cutting straight through dark desert sand with white cut-out halo edges, bold black outlines, clear water markings, and miniature cargo ship silhouettes.
- "the sovereign debt ledger": A giant accounting book labeled "DEBT" in crimson red (#C8252B), covered in compounding interest formulas, red warning stamps, and fine print contract clauses.
- "the four-million-pound check": A vintage bank draft check with bold black outlines, pure white paper, and a bold dollar green (#3DAA72) "£4,000,000" stamp in the center.
- "the steam dredger": A clanking mechanical steam excavator made of dark charcoal iron with bold black outlines, a tall chimney puffing black smoke, and heavy iron scoop buckets.
- "the imperial repo cage": A towering iron birdcage / sovereign trap with bold black bars, a heavy brass padlock, and crimson red (#C8252B) repossession tags.

Mascot (identical in every image where he appears):
"the mascot" is the Dollar Doodles stickman from the reference image, with a round white head, bold black outlines, white stick body, red backwards snapback cap and red hoodie, with deadpan, expressive, street-smart expressions.`;
  }

  // Format renaming rule
  const renamingInstruction = `after generation complete rename them based on image prompt name for example image 1 prompt generated image name will be img-${paddedProjectNum}-01, image 2 prompt generated image name will be img-${paddedProjectNum}-02 and so on`;

  // Parse and validate scene prompt items
  const sceneItems: ScenePromptItem[] = [];
  const allowedAngles = [
    "Eye-level frontal shot",
    "Medium shot",
    "Wide shot",
    "Profile shot",
    "Low-angle shot",
    "High-angle shot",
    "Dutch-angle (tilted) shot",
    "Top-down shot",
    "Extreme close-up",
    "Macro detail shot",
    "Over-the-shoulder shot",
    "Behind-the-character shot",
  ];

  let prevAngle = "";
  for (let i = 0; i < subtitleItems.length; i++) {
    const targetIdx = i + 1;
    let rawLine = allScenePrompts.find((p) =>
      new RegExp(`^image\\s+${targetIdx}\\s*:`, "i").test(p),
    );

    if (!rawLine) {
      // Pick a rotating distinct angle
      const availableAngles = allowedAngles.filter((a) => a !== prevAngle);
      const chosenAngle = availableAngles[i % availableAngles.length];
      const desc = `The mascot gestures with a deadpan expression beside a sticker illustration of the financial concept: ${subtitleItems[i].slice(0, 80)}.`;
      rawLine = `image ${targetIdx}: ${chosenAngle}. ${desc}`;
    }

    // Clean angle and description
    const match = rawLine.match(/^image\s+\d+\s*:\s*([^.]+)\.\s*(.*)$/i);
    let angle = match ? match[1].trim() : "Medium shot";
    const desc = match
      ? match[2].trim()
      : rawLine.replace(/^image\s+\d+\s*:\s*/i, "");

    // Guarantee no consecutive angle duplicates
    if (angle.toLowerCase() === prevAngle.toLowerCase()) {
      const candidates = allowedAngles.filter(
        (a) => a.toLowerCase() !== prevAngle.toLowerCase(),
      );
      angle = candidates[i % candidates.length];
    }
    prevAngle = angle;

    const fullPrompt = `image ${targetIdx}: ${angle}. ${desc}`;
    sceneItems.push({
      id: targetIdx,
      cameraAngle: angle,
      description: desc,
      fullPrompt,
    });
  }

  const scenePromptsContent = `${sceneItems.map((s) => s.fullPrompt).join("\n")}\n\n${renamingInstruction}`;

  return {
    styleContent: styleRulesContent,
    scenePromptsContent,
    scenes: sceneItems,
    renamingInstruction,
    totalScenes: sceneItems.length,
    modelUsed: modelUsedFinal,
  };
}

/**
 * GENERATE PROMPT 3: Viral Metadata & Thumbnail Packaging
 */
export async function generateDollarDoodlesMetadata({
  script,
  apiKey,
}: {
  script: string;
  apiKey?: string;
}): Promise<MetadataResult> {
  const activeKey =
    apiKey?.trim() ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!activeKey) {
    throw new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in .env.local or enter it in the studio.",
    );
  }

  if (!script || !script.trim()) {
    throw new Error("Please provide a video script to generate metadata.");
  }

  const systemPrompt = `You are a YouTube packaging expert specializing in high-CTR, high-retention 2D Stickman videos for Dollar Doodles — a Financial World channel that exposes money myths, pricing psychology, financial system mechanics, and economic street smarts.

Your job is to turn a Dollar Doodles video script into ready-to-publish metadata that attracts clicks without resorting to fake-guru clickbait or unrealistic financial promises.

Channel Voice: Sharp, grounded, street-smart, second-person, deadpan. Like a financially fluent friend pulling back the curtain — never smug, never preachy.
Brand Colors: Deep charcoal (#1a1a1a), Crimson Red (#C8252B) for loss/danger, Dollar Green (#3DAA72) for gains/money, White with black outlines.
Standard Disclaimer: "Note: This video is for educational and informational purposes only and does not constitute individualized financial advice."

OUTPUT RULES:
1. VIRAL VIDEO TITLES (4 options, best first):
- Under 70 characters each.
- Angle 1: Provocative question (challenges an everyday money habit).
- Angle 2: Counterintuitive reframe (why a 'smart' move backfires).
- Angle 3: Street-smart truth reveal (exposing the hidden financial game).
- Angle 4: Curiosity gap (high-intrigue, minimalist phrasing).

2. VIDEO DESCRIPTION:
- Hook (2-3 sentences, main financial topic keyword in the first 100 characters).
- Summary paragraph (3-4 sentences in Dollar Doodles sharp second-person voice).
- CTA line inviting viewers to share their take and subscribe.
- Standard disclaimer on its own line.
- Exactly 3 relevant hashtags on one line (#Tag1 #Tag2 #DollarDoodles).

3. VIRAL VIDEO TAGS:
- Exactly 10 SEO tags in a single comma-separated line.
- Plain keywords only, no hashtags, under 500 characters.

4. THUMBNAIL PROMPTS (4 High-CTR Concepts for Google Flow):
- 16:9 widescreen single image prompts referencing the attached reference image for art style, line work, colors, lettering, character design.
- Thumbnail 1 (Curiosity Gap): Visual anomaly + 1-2 word question in red or green.
- Thumbnail 2 (Shocking Contrast): Split-screen or before/after reality vs hidden cost.
- Thumbnail 3 (Expressive Reaction): Dollar Doodles mascot (stickman in red backwards cap and red hoodie) realizing a statement/price is rigged.
- Thumbnail 4 (Scale Contrast): Tiny mascot vs giant financial machine/debt ledger.
- At most 1 text element per thumbnail, 1-3 words in ALL CAPS in quotes (e.g. Text: "THE TRAP" in red). Away from bottom-right corner.

OUTPUT FORMAT (Wrap each in marked blocks):
=== TITLES ===
[Title 1]
[Title 2]
[Title 3]
[Title 4]

=== DESCRIPTION ===
[Full description]

=== TAGS ===
tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10

=== THUMBNAILS ===
Thumbnail 1 (Curiosity Gap): [Prompt]

Thumbnail 2 (Shocking Contrast): [Prompt]

Thumbnail 3 (Expressive Reaction): [Prompt]

Thumbnail 4 (Scale Contrast): [Prompt]`;

  const userMessage = `Here is the full Dollar Doodles video script:\n\n${script.slice(0, 12000)}`;

  const result = await callGeminiApi(systemPrompt, userMessage, activeKey);

  // Parse titles
  const titlesMatch = result.text.match(
    /===\s*TITLES\s*===([\s\S]*?)(?====\s*DESCRIPTION\s*===|$)/i,
  );
  const titles = titlesMatch
    ? titlesMatch[1]
        .split(/\r?\n/)
        .map((t) => t.replace(/^\d+[.)]\s*/, "").trim())
        .filter((t) => t.length > 5 && !t.startsWith("["))
        .slice(0, 4)
    : [
        "How Did a $10 Billion Shortcut Bankrupt an Entire Empire?",
        "Why Owning the Suez Canal Left Egypt Completely Broke",
        "The 19th-Century Debt Trap That Stole the Suez Canal",
        "The £4 Million Heist: How Bankers Seized an Empire",
      ];

  // Parse description
  const descMatch = result.text.match(
    /===\s*DESCRIPTION\s*===([\s\S]*?)(?====\s*TAGS\s*===|$)/i,
  );
  let description = descMatch ? descMatch[1].trim() : "";
  if (!description) {
    description = `The Suez Canal generates $10 billion in tolls today, but the country that built it went completely bankrupt. They dug it with their hands, funded the machines with debt, and lost every share to a £4 million check.\n\nIn this video, you'll see how predatory sovereign lending, compounding interest, and massive cost overruns turned the greatest engineering triumph of the 19th century into the darkest corporate raid in modern history.\n\nWhat would you bet on: slow debt-free growth or taking massive leverage? Tell us in the comments, and subscribe to Dollar Doodles for more street-smart financial breakdowns.\n\nNote: This video is for educational and informational purposes only and does not constitute individualized financial advice.\n\n#SovereignDebt #FinancialLiteracy #DollarDoodles`;
  }

  // Parse tags
  const tagsMatch = result.text.match(
    /===\s*TAGS\s*===([\s\S]*?)(?====\s*THUMBNAILS\s*===|$)/i,
  );
  const tagsString = tagsMatch ? tagsMatch[1].trim() : "";
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 10)
    : [
        "suez canal history",
        "sovereign debt trap",
        "predatory lending explained",
        "financial literacy",
        "how debt works",
        "rothschild banking",
        "leverage in finance",
        "corporate raid history",
        "money psychology",
        "everyday economics",
      ];

  // Parse thumbnails
  const thumbMatch = result.text.match(/===\s*THUMBNAILS\s*===([\s\S]*?)$/i);
  const thumbRaw = thumbMatch ? thumbMatch[1].trim() : "";
  const thumbnailPrompts: { type: string; prompt: string }[] = [];

  const thumbBlocks = thumbRaw.split(/Thumbnail\s+\d+\s*\(([^)]+)\)\s*:\s*/i);
  if (thumbBlocks.length > 1) {
    for (let i = 1; i < thumbBlocks.length; i += 2) {
      const type = thumbBlocks[i]?.trim() || "Concept";
      const prompt =
        thumbBlocks[i + 1]?.trim().replace(/\n\nThumbnail[\s\S]*/, "") || "";
      if (prompt) {
        thumbnailPrompts.push({ type, prompt });
      }
    }
  }

  if (thumbnailPrompts.length === 0) {
    thumbnailPrompts.push(
      {
        type: "Curiosity Gap",
        prompt: `16:9 widescreen single image, using the attached reference image for art style, line work, colors, lettering, and character design. Eye-level frontal shot. A massive container ship sails through a narrow desert trench, with a giant vintage £4,000,000 bank check acting as a locked toll gate across the water. Keep the ship and gate in the left and center of the frame against a solid deep charcoal background (#1a1a1a). Text: "STOLEN?" in red, placed top-left.`,
      },
      {
        type: "Shocking Contrast",
        prompt: `16:9 widescreen single image, using the attached reference image for art style, line work, colors, lettering, and character design. Medium shot, split down the middle. On the left, a towering green pyramid of crisp 100-dollar bills with glowing trade routes. On the right, a shattered empty treasury vault stamped with a bold red foreclosure notice, surrounded by sand drifts. Text: "BANKRUPT" in red, placed top-center.`,
      },
      {
        type: "Expressive Reaction",
        prompt: `16:9 widescreen single image, using the attached reference image for art style, line work, colors, lettering, and character design. Low-angle shot. The Dollar Doodles mascot (stickman in a red backwards snapback cap and red hoodie) stands on the left, staring wide-eyed in shock at a towering promissory note contract in his hand, where compounding 14% interest numbers bleed off the paper in crimson red (#C8252B). Text: "THE TRAP" in red, placed top-left.`,
      },
      {
        type: "Scale Contrast",
        prompt: `16:9 widescreen single image, using the attached reference image for art style, line work, colors, lettering, and character design. High-angle shot. A tiny Dollar Doodles mascot (stickman in a red backwards snapback cap and red hoodie) stands at the center looking up at a colossal iron bear-trap ledger labeled "DEBT" looming high over the entire canal waterway, ready to snap shut. Text: "WHO OWNS IT?" in red, placed top-left.`,
      },
    );
  }

  const rawMetadataText = `VIRAL VIDEO TITLES (4 options, best first)
=========================================
${titles.join("\n")}

VIDEO DESCRIPTION
=================
${description}

VIRAL VIDEO TAGS (10, comma-separated)
======================================
${tags.join(", ")}

THUMBNAIL PROMPTS (4 High-CTR Concepts for Google Flow)
=============================================
${thumbnailPrompts.map((t, idx) => `Thumbnail ${idx + 1} (${t.type}): ${t.prompt}`).join("\n\n")}`;

  return {
    titles,
    description,
    tags,
    thumbnailPrompts,
    rawContent: rawMetadataText,
    modelUsed: result.model,
  };
}
