interface MailtoFallbackProps {
	contactEmail: string;
	prefillBody: string;
}

export default function MailtoFallback({ contactEmail, prefillBody }: MailtoFallbackProps) {
	const subject = encodeURIComponent("[tkstar.dev] Contact form fallback");
	const body = encodeURIComponent(prefillBody);
	const href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
	return (
		<section
			role="alert"
			className="flex flex-col gap-3 rounded-lg border border-warn bg-bg-card px-5 py-5"
		>
			<h2 className="m-0 font-mono text-[15px] font-semibold text-warn">
				<span aria-hidden="true" className="mr-1">
					✗
				</span>
				전송에 실패했습니다.
			</h2>
			<p className="m-0 font-mono text-[13px] leading-[1.7] text-fg">
				일시적인 문제로 보입니다. 아래 메일 링크로 직접 문의 부탁드립니다.
			</p>
			<a
				href={href}
				data-testid="mailto-fallback"
				className="inline-flex w-fit items-center gap-2 rounded-md border border-accent bg-accent px-4 py-2 font-mono text-[13px] font-medium text-on-accent no-underline transition-[filter] duration-[var(--duration-120)] ease-out hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
			>
				<span aria-hidden="true">✉</span>
				{contactEmail} 로 메일 보내기
			</a>
		</section>
	);
}
