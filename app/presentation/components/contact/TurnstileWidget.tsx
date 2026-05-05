import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
	siteKey: string;
	onToken: (token: string) => void;
}

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: { sitekey: string; callback: (token: string) => void },
			) => string;
			remove: (widgetId: string) => void;
		};
	}
}

export default function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const SCRIPT_ID = "cf-turnstile-script";
		const ensureScript = () => {
			if (document.getElementById(SCRIPT_ID)) return;
			const s = document.createElement("script");
			s.id = SCRIPT_ID;
			s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
			s.async = true;
			s.defer = true;
			document.head.appendChild(s);
		};

		let widgetId: string | undefined;
		ensureScript();
		const tryRender = () => {
			if (window.turnstile && containerRef.current) {
				widgetId = window.turnstile.render(containerRef.current, {
					sitekey: siteKey,
					callback: onToken,
				});
				return true;
			}
			return false;
		};
		if (!tryRender()) {
			const interval = window.setInterval(() => {
				if (tryRender()) window.clearInterval(interval);
			}, 200);
			return () => {
				window.clearInterval(interval);
				if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
			};
		}
		return () => {
			if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
		};
	}, [siteKey, onToken]);

	return <div ref={containerRef} data-testid="turnstile-widget" />;
}
