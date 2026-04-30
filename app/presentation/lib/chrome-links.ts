type ChromeLink = {
	label: string;
	href: string;
	external?: boolean;
};

export const TOPBAR_LINKS: ChromeLink[] = [
	{ label: "about", href: "/about" },
	{ label: "projects", href: "/projects" },
	{ label: "blog", href: "/blog" },
];

// TODO: X / RSS placeholder — T0xx에서 실 URL 확정 시 교체. external: true로 두어 SPA navigation 회피.
export const FOOTER_LINKS: ChromeLink[] = [
	{ label: "GitHub", href: "https://github.com/onepunch-tk", external: true },
	{ label: "X", href: "#", external: true },
	{ label: "RSS", href: "#", external: true },
	{ label: "Contact", href: "/contact" },
];
