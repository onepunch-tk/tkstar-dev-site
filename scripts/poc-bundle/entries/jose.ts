import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
	new URL("https://example.cloudflareaccess.com/cdn-cgi/access/certs"),
);

export default {
	async fetch(req: Request): Promise<Response> {
		const token = req.headers.get("cf-access-jwt-assertion") ?? "";
		try {
			const { payload } = await jwtVerify(token, JWKS, {
				audience: "aud-placeholder",
			});
			return new Response(JSON.stringify(payload));
		} catch {
			return new Response("invalid", { status: 401 });
		}
	},
};
