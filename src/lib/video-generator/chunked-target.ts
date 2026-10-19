/**
 * High-performance chunked memory target that never allocates giant contiguous ArrayBuffers.
 * Safe from single-buffer browser limits during 2K and 1080p long video generation.
 */
export class ChunkedMemoryTarget {
  chunkSize: number;
  chunks: Uint8Array[];
  totalSize: number;

  constructor(chunkSize = 16 * 1024 * 1024) {
    this.chunkSize = chunkSize;
    this.chunks = [];
    this.totalSize = 0;
  }

  write(data: Uint8Array, position: number): void {
    let offset = 0;
    while (offset < data.byteLength) {
      const currentPos = position + offset;
      const chunkIdx = Math.floor(currentPos / this.chunkSize);
      const chunkOffset = currentPos % this.chunkSize;
      const bytesToWrite = Math.min(
        data.byteLength - offset,
        this.chunkSize - chunkOffset,
      );

      if (!this.chunks[chunkIdx]) {
        this.chunks[chunkIdx] = new Uint8Array(this.chunkSize);
      }

      this.chunks[chunkIdx].set(
        data.subarray(offset, offset + bytesToWrite),
        chunkOffset,
      );
      offset += bytesToWrite;
      this.totalSize = Math.max(this.totalSize, currentPos + bytesToWrite);
    }
  }

  toBlob(type = "video/mp4"): Blob {
    const finalBlobs: BlobPart[] = [];
    let remaining = this.totalSize;

    for (let i = 0; i < this.chunks.length && remaining > 0; i++) {
      const chunk = this.chunks[i];
      const take = Math.min(remaining, this.chunkSize);
      if (take === this.chunkSize) {
        finalBlobs.push(chunk as BlobPart);
      } else {
        finalBlobs.push(chunk.subarray(0, take) as BlobPart);
      }
      remaining -= take;
    }

    return new Blob(finalBlobs, { type });
  }

  clear(): void {
    this.chunks = [];
    this.totalSize = 0;
  }
}
