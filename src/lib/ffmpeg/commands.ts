interface FFmpegFilter {
  type: "vibrance" | "contrast";
  value: number;
}

interface FFmpegOptions {
  inputPath: string;
  outputPath: string;
  resolution: string;
  fps: number;
  srtPath?: string | null;
  musicPath?: string | null;
  musicVolume?: number;
  filters?: FFmpegFilter[];
}

export function buildFFmpegCommand(opts: FFmpegOptions) {
  const [width, height] = opts.resolution.split("x");
  const inputArgs = [`-i "${opts.inputPath}"`];
  const filterParts: string[] = [];
  const colorFilters = (opts.filters ?? [])
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

  filterParts.push(
    `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2${colorFilters ? `,${colorFilters}` : ""}[video]`,
  );

  let videoOutput = "[video]";

  if (opts.srtPath) {
    filterParts.push(
      `${videoOutput}subtitles='${opts.srtPath}':force_style='FontName=Cairo,FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Alignment=2'[captioned]`,
    );
    videoOutput = "[captioned]";
  }

  let audioMap = "-map 0:a?";
  if (opts.musicPath) {
    inputArgs.push(`-i "${opts.musicPath}"`);
    filterParts.push(
      `[0:a]volume=1[a0];[1:a]volume=${opts.musicVolume ?? 0.3}[a1];[a0][a1]amix=inputs=2:duration=first[audio]`,
    );
    audioMap = '-map "[audio]"';
  }

  return [
    "ffmpeg -y",
    inputArgs.join(" "),
    `-filter_complex "${filterParts.join(";")}"`,
    `-map "${videoOutput}"`,
    audioMap,
    "-c:v libx264 -preset fast -crf 23",
    "-c:a aac -b:a 128k",
    `-r ${opts.fps}`,
    "-movflags +faststart",
    `"${opts.outputPath}"`,
  ].join(" ");
}
