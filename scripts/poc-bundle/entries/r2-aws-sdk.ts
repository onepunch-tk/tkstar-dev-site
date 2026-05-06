import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
	region: "auto",
	endpoint: "https://placeholder.r2.cloudflarestorage.com",
	credentials: { accessKeyId: "x", secretAccessKey: "x" },
});

export default {
	async fetch(): Promise<Response> {
		const res = await client.send(
			new PutObjectCommand({ Bucket: "bucket", Key: "key", Body: "x" }),
		);
		return new Response(JSON.stringify(res.$metadata));
	},
};
