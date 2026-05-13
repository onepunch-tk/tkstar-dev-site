import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "../format-relative-time";

const NOW = 1714291200; // 2024-04-28T08:00:00Z (테스트 기준 시각)

describe("formatRelativeTime", () => {
	it("1분 미만 → 'just now'", () => {
		expect(formatRelativeTime(NOW - 30, NOW)).toBe("just now");
		expect(formatRelativeTime(NOW, NOW)).toBe("just now");
	});

	it("1분 이상 1시간 미만 → 'Nm ago'", () => {
		expect(formatRelativeTime(NOW - 60, NOW)).toBe("1m ago");
		expect(formatRelativeTime(NOW - 60 * 5, NOW)).toBe("5m ago");
		expect(formatRelativeTime(NOW - 60 * 59, NOW)).toBe("59m ago");
	});

	it("1시간 이상 24시간 미만 → 'Nh ago'", () => {
		expect(formatRelativeTime(NOW - 60 * 60, NOW)).toBe("1h ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 2, NOW)).toBe("2h ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 23, NOW)).toBe("23h ago");
	});

	it("1일 이상 7일 미만 → 'Nd ago'", () => {
		expect(formatRelativeTime(NOW - 60 * 60 * 24, NOW)).toBe("1d ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 3, NOW)).toBe("3d ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 6, NOW)).toBe("6d ago");
	});

	it("7일 이상 30일 미만 → 'Nw ago'", () => {
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 7, NOW)).toBe("1w ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 14, NOW)).toBe("2w ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 29, NOW)).toBe("4w ago");
	});

	it("30일 이상 365일 미만 → 'Nmo ago'", () => {
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 30, NOW)).toBe("1mo ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 90, NOW)).toBe("3mo ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 364, NOW)).toBe("12mo ago");
	});

	it("365일 이상 → 'Ny ago'", () => {
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 365, NOW)).toBe("1y ago");
		expect(formatRelativeTime(NOW - 60 * 60 * 24 * 365 * 2, NOW)).toBe("2y ago");
	});

	it("미래 시각도 'just now' 처리 (음수 diff)", () => {
		expect(formatRelativeTime(NOW + 60, NOW)).toBe("just now");
	});
});
