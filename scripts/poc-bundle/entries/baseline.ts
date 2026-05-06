// T023 PoC — baseline (no extra deps). Establishes minimum Workers bundle floor.
export default {
	async fetch(): Promise<Response> {
		return new Response("ok");
	},
};
