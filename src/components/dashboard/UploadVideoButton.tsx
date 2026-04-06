"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

async function extractVideoMetadata(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Unable to read video metadata."));
    });

    const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0;
    video.currentTime = Math.min(1, Math.max(durationSeconds / 4, 0));

    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 540;
    canvas.height = video.videoHeight || 960;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create thumbnail preview.");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumbnailBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.82);
    });

    return { durationSeconds, thumbnailBlob };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function UploadVideoButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const { durationSeconds, thumbnailBlob } = await extractVideoMetadata(file);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^.]+$/, ""));
      formData.append("durationSeconds", String(durationSeconds));

      if (thumbnailBlob) {
        formData.append("thumbnail", thumbnailBlob, "thumbnail.jpg");
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      if (data.projectId) {
        router.push(`/editor/${data.projectId}`);
        router.refresh();
      }
    } finally {
      setPending(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload video"}
      </button>
      {error ? <p className="max-w-xs text-right text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
