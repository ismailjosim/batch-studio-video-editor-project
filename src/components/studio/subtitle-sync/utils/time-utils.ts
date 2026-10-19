const TIME_REGEX = /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/;

/**
 * Parses an SRT time string (e.g. "00:01:23,456" or "00:01:23.456") into milliseconds.
 */
export function parseTimecode(tc: string): number {
  const match = tc.trim().match(TIME_REGEX);
  if (!match) {
    const parts = tc.trim().replace(".", ",").split(":");
    if (parts.length >= 3) {
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      const secParts = parts[2].split(",");
      const seconds = parseInt(secParts[0], 10) || 0;
      const ms = parseInt(secParts[1], 10) || 0;
      return (hours * 3600 + minutes * 60 + seconds) * 1000 + ms;
    }
    return 0;
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const ms = parseInt(match[4], 10);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + ms;
}

/**
 * Formats milliseconds into standard SRT format: "HH:MM:SS,mmm"
 */
export function formatTimecode(milliseconds: number): string {
  const safeMs = Math.max(0, Math.round(milliseconds));
  const hours = Math.floor(safeMs / 3600000);
  const remMinutes = safeMs % 3600000;
  const minutes = Math.floor(remMinutes / 60000);
  const remSeconds = remMinutes % 60000;
  const seconds = Math.floor(remSeconds / 1000);
  const ms = remSeconds % 1000;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

/**
 * Formats time in seconds or milliseconds into compact readable string: "MM:SS.mmm" or "HH:MM:SS"
 */
export function formatDisplayTime(
  seconds: number,
  includeMs = false,
  forceHours = false,
): string {
  const safeSeconds = Math.max(0, seconds);
  const totalMs = Math.round(safeSeconds * 1000);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = Math.floor(safeSeconds % 60);
  const fraction = includeMs
    ? `.${String(Math.floor(totalMs % 1000)).padStart(3, "0")}`
    : "";

  if (hours > 0 || forceHours) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}${fraction}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}${fraction}`;
}
