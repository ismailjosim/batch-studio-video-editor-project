"use client";

import { useRouter } from "next/navigation";
import { NanoBananaStudio } from "@/components/studio/nano-banana/NanoBananaStudio";
import { saveTransferImages } from "@/lib/studio-transfer";

export function ImageGeneratorClient() {
  const router = useRouter();

  const handleSendToVideoGenerator = (images: HTMLImageElement[]) => {
    const urls = images.map((img) => img.src);
    saveTransferImages(urls);
    router.push("/dashboard/video-editor");
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300 pb-16">
      <NanoBananaStudio onSendToVideoGenerator={handleSendToVideoGenerator} />
    </div>
  );
}
