import { useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "proto-theme";

const readInitial = (): { theme: Theme; isSystem: boolean } => {
	if (typeof window === "undefined") {
		return { theme: "dark", isSystem: true };
	}
	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (stored === "dark" || stored === "light") {
		return { theme: stored, isSystem: false };
	}
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	return { theme: prefersDark ? "dark" : "light", isSystem: true };
};

export const useTheme = (): {
	theme: Theme;
	setTheme: (value: Theme) => void;
	isSystem: boolean;
} => {
	const [state, setState] = useState(readInitial);

	const setTheme = (value: Theme) => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(STORAGE_KEY, value);
		document.documentElement.dataset.theme = value;
		setState({ theme: value, isSystem: false });
	};

	return { theme: state.theme, setTheme, isSystem: state.isSystem };
};
