import type { ImgHTMLAttributes } from "react";

const images: Record<string, { width: number; height: number; widths: number[] }> = {
  hero: { width: 1792, height: 1008, widths: [480, 960, 1440] },
  parramatta: { width: 1792, height: 1008, widths: [480, 960, 1440] },
  files: { width: 1600, height: 1200, widths: [320, 640, 960] },
  ergonomic: { width: 1600, height: 1200, widths: [320, 640, 960] },
  fce: { width: 1600, height: 1200, widths: [320, 640, 960] },
  manual: { width: 1600, height: 1200, widths: [320, 640, 960] },
  "greg-weir": { width: 1100, height: 1555, widths: [] },
  "matt-holdt": { width: 1100, height: 1559, widths: [] },
};

type ResponsiveImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "sizes"> & {
  src: string;
  sizes: string;
  priority?: boolean;
};

export function ResponsiveImage({
  src,
  sizes,
  priority = false,
  ...props
}: ResponsiveImageProps) {
  const name = src.match(/^\/images\/([a-z-]+)\.jpg$/)?.[1];
  const image = name && images[name];
  if (!image) throw new Error(`Missing responsive image variants for ${src}`);

  return (
    <picture className="block h-full w-full">
      {image.widths.length > 0 && (
        <source
          type="image/webp"
          srcSet={image.widths
            .map((width) => `/images/${name}-${width}.webp ${width}w`)
            .join(", ")}
          sizes={sizes}
        />
      )}
      <img
        src={src}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        {...props}
      />
    </picture>
  );
}