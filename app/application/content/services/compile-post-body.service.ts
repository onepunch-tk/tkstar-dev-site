export const computeBodyHash = async (rawMarkdown: string): Promise<string> => {
	const encoded = new TextEncoder().encode(rawMarkdown);
	const buffer = await crypto.subtle.digest("SHA-256", encoded);
	const hex = Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hex.slice(0, 16);
};
