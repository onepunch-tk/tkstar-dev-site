export type AnalyticsScriptProps = {
	defer: true;
	src: "https://static.cloudflareinsights.com/beacon.min.js";
	"data-cf-beacon": string;
};

export const getAnalyticsScriptProps = (token: string | undefined): AnalyticsScriptProps | null => {
	if (!token) return null;
	return {
		defer: true,
		src: "https://static.cloudflareinsights.com/beacon.min.js",
		"data-cf-beacon": JSON.stringify({ token }),
	};
};
