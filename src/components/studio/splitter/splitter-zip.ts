import JSZip from "jszip";
import type { ParsedSubtitle, SplitBatch } from "./splitter-types";

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileSystemFileHandle>;
};

export async function createAndSaveBatchesZip(
  fileName: string,
  parsedSubs: ParsedSubtitle[],
  batchSize: number,
  batches: SplitBatch[],
): Promise<boolean> {
  const zip = new JSZip();
  const folderName = `${fileName || "SRT"}_Batches`;
  const baseFolder = zip.folder(folderName);

  let summaryText = `DOLLAR DOODLES - SRT BATCH SPLITTER SUMMARY\n`;
  summaryText += `==========================================\n`;
  summaryText += `File: ${fileName}.srt\n`;
  summaryText += `Total Subtitles: ${parsedSubs.length}\n`;
  summaryText += `Batch Size: ${batchSize} subtitles per batch\n`;
  summaryText += `Total Batches: ${batches.length}\n`;
  summaryText += `Generated At: ${new Date().toLocaleString()}\n`;
  summaryText += `==========================================\n\n`;
  summaryText += `BATCH BREAKDOWN TABLE:\n`;
  summaryText += `------------------------------------------------------------------------------------------------\n`;

  for (const batch of batches) {
    baseFolder?.file(`batch-${batch.batchStr}.srt`, batch.srtContent);
    baseFolder?.file(`batch-${batch.batchStr}.txt`, batch.txtContent);
    summaryText += `Batch ${batch.batchStr} | Subs ${String(batch.firstId).padStart(3, "0")} - ${String(batch.lastId).padStart(3, "0")} (${batch.subtitles.length} subs) | Time: ${batch.timeRange}\n`;
  }

  summaryText += `------------------------------------------------------------------------------------------------\n`;
  baseFolder?.file("summary.txt", summaryText);

  const content = await zip.generateAsync({ type: "blob" });
  const zipFileName = `${folderName}.zip`;

  const win = window as SaveFilePickerWindow;
  if (win.showSaveFilePicker) {
    try {
      const handle = await win.showSaveFilePicker({
        suggestedName: zipFileName,
        types: [
          {
            description: "ZIP Archive (*.zip)",
            accept: { "application/zip": [".zip"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === "AbortError") {
        return false;
      }
    }
  }

  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
