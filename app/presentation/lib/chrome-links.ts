type ChromeLink = {
	label: string;
	href: string;
	external?: boolean;
};

// TODO: X placeholder — T0xx에서 실 URL 확정 시 교체. external: true로 두어 SPA navigation 회피.
export const FOOTER_LINKS: ChromeLink[] = [
	{ label: "GitHub", href: "https://github.com/onepunch-tk", external: true },
	{ label: "X", href: "#", external: true },
	{ label: "RSS", href: "/rss.xml", external: true },
	{ label: "Contact", href: "/contact" },
];
