import { AwsClient } from "aws4fetch";

const client = new AwsClient({
	accessKeyId: "placeholder",
	secretAccessKey: "placeholder",
	service: "s3",
	region: "auto",
});

export default {
	async fetch(): Promise<Response> {
		const res = await client.fetch("https://placeholder.r2.cloudflarestorage.com/bucket/key", {
			method: "PUT",
			body: "x",
		});
		return new Response(`${res.status}`);
	},
};
