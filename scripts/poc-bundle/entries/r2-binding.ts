// R2 Workers binding only — no extra deps installed. Measures Workers runtime API surface cost.
// @ts-nocheck — PoC measurement entry; R2Bucket type lives in worker-configuration.d.ts which this script doesn't import.

export default {
	async fetch(
		req: Request,
		env: { MEDIA_BUCKET: { put: Function; get: Function } },
	): Promise<Response> {
		if (req.method === "PUT") {
			await env.MEDIA_BUCKET.put("key", req.body);
			return new Response("ok");
		}
		const obj = await env.MEDIA_BUCKET.get("key");
		return obj ? new Response(obj.body) : new Response("not found", { status: 404 });
	},
};
