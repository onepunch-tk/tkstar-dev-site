export const assertExists = <T>(value: T | null, makeError: () => Error): T => {
	if (value === null) throw makeError();
	return value;
};
