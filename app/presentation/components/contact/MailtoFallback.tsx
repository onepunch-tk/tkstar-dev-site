interface MailtoFallbackProps {
	contactEmail: string;
	prefillBody: string;
}

export default function MailtoFallback({ contactEmail, prefillBody }: MailtoFallbackProps) {
	const subject = encodeURIComponent("[tkstar.dev] Contact form fallback");
	const body = encodeURIComponent(prefillBody);
	const href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
	return (
		<section role="alert">
			<h2>전송에 실패했습니다.</h2>
			<p>
				아래 메일 링크로 직접 문의해주세요.{" "}
				<a href={href} data-testid="mailto-fallback">
					{contactEmail} 로 메일 보내기
				</a>
			</p>
		</section>
	);
}
