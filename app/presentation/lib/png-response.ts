export const PNG_HEADERS = {
	"Content-Type": "image/png",
	"Cache-Control": "public, max-age=31536000, immutable",
} as const;

export const toPngBody = (png: Uint8Array): ArrayBuffer =>
	png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
