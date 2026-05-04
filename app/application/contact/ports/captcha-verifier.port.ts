export interface CaptchaVerifier {
	verify(token: string, ip: string): Promise<boolean>;
}
