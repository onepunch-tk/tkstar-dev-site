export class InvalidContactSubmissionError extends Error {
	constructor(issues: string) {
		super(`Invalid contact submission: ${issues}`);
		this.name = "InvalidContactSubmissionError";
	}
}
