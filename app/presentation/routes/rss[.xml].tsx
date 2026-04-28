export const loader = () => {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>tkstar.dev</title></channel></rss>`;
	return new Response(body, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
