type ChromeLink = {
	label: string;
	href: string;
	external?: boolean;
};

export const TOPBAR_LINKS: ChromeLink[] = [
	{ label: "about", href: "/about" },
	{ label: "projects", href: "/projects" },
	{ label: "blog", href: "/blog" },
	{ label: "now", href: "/now" },
];

// TODO: X / RSS / Contact placeholder — T015(legal) 또는 별도 task에서 실 URL로 교체
export const FOOTER_LINKS: ChromeLink[] = [
	{ label: "GitHub", href: "https://github.com/onepunch-tk", external: true },
	{ label: "X", href: "#" },
	{ label: "RSS", href: "#" },
	{ label: "Contact", href: "/contact" },
];
