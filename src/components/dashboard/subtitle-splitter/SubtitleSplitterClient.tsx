"use client";

import { useRouter } from "next/navigation";
import { SrtBatchSplitter } from "@/components/studio/SrtBatchSplitter";
import { saveTransferCues } from "@/lib/studio-transfer";
import type { SRTData } from "@/lib/video-generator/types";

export function SubtitleSplitterClient() {
  const router = useRouter();

  const handleSendToGenerator = (batchSrt: SRTData) => {
    saveTransferCues(batchSrt);
    router.push("/dashboard/video-editor");
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300 pb-16">
      <SrtBatchSplitter onSendToGenerator={handleSendToGenerator} />
    </div>
  );
}
