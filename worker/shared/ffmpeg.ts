interface FFmpegFilter {
  type: "vibrance" | "contrast";
  value: number;
}

interface FFmpegOptions {
  inputPath: string;
  outputPath: string;
  resolution: string;
  fps: number;
  filters?: FFmpegFilter[];
}

export function buildFFmpegArgs(options: FFmpegOptions) {
  const [width, height] = options.resolution.split("x");
  const filters = (options.filters ?? [])
    .map((filter) => {
      if (filter.type === "vibrance") {
        return `eq=saturation=${filter.value}`;
      }

      if (filter.type === "contrast") {
        return `eq=contrast=${filter.value}`;
      }

      return null;
    })
    .filter(Boolean)
    .join(",");

  const videoFilter = `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2${filters ? `,${filters}` : ""}[video]`;

  return [
    "-y",
    "-i",
    options.inputPath,
    "-filter_complex",
    videoFilter,
    "-map",
    "[video]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-r",
    String(options.fps),
    "-movflags",
    "+faststart",
    options.outputPath,
  ];
}
