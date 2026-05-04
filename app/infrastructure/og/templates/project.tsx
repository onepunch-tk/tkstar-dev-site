import { createElement, type ReactNode } from "react";

const COLOR = {
	bg: "#0d0f12",
	fg: "#e8ebef",
	muted: "#8a93a0",
	line: "#2a3038",
	accent: "#36d399",
} as const;

const formatDate = (iso: string): string => iso.slice(0, 10);

export const projectTemplate = (input: {
	title: string;
	date: string;
	tags: string[];
}): ReactNode =>
	createElement(
		"div",
		{
			style: {
				width: "1200px",
				height: "630px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "72px",
				backgroundColor: COLOR.bg,
				color: COLOR.fg,
				fontFamily: "JetBrains Mono",
				borderTop: `8px solid ${COLOR.accent}`,
			},
		},
		createElement(
			"div",
			{ style: { display: "flex", flexDirection: "column", gap: "32px" } },
			createElement(
				"div",
				{
					style: {
						fontSize: "24px",
						fontWeight: 700,
						letterSpacing: "0.2em",
						color: COLOR.accent,
					},
				},
				"PROJECT",
			),
			createElement(
				"div",
				{
					style: {
						fontSize: "72px",
						fontWeight: 700,
						lineHeight: 1.1,
						letterSpacing: "-0.02em",
					},
				},
				input.title,
			),
		),
		createElement(
			"div",
			{
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
					borderTop: `1px solid ${COLOR.line}`,
					paddingTop: "32px",
				},
			},
			createElement(
				"div",
				{ style: { display: "flex", gap: "20px", color: COLOR.muted, fontSize: "24px" } },
				createElement("span", null, formatDate(input.date)),
				input.tags.length > 0
					? createElement("span", null, input.tags.map((t) => `#${t}`).join("  "))
					: null,
			),
			createElement(
				"div",
				{ style: { fontSize: "24px", color: COLOR.fg, fontWeight: 700 } },
				"tkstar.dev →",
			),
		),
	);
