// T010 placeholder. T016에서 실제 Command Palette open 로직으로 교체.
export const useCommandPalette = (): { open: () => void } => {
	return {
		open: () => {
			/* T016 wires real palette */
		},
	};
};
