export const getAnalyticsScriptProps = (token: string | undefined) => {
	if (!token) return null;
	return {
		defer: true as const,
		src: "https://static.cloudflareinsights.com/beacon.min.js" as const,
		"data-cf-beacon": JSON.stringify({ token }),
	};
};
