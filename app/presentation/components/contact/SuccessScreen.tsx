import { Link } from "react-router";

export default function SuccessScreen() {
	return (
		<section
			role="status"
			aria-live="polite"
			className="flex flex-col items-center gap-3 rounded-lg border border-accent bg-bg-card px-6 py-8 text-center"
		>
			<div aria-hidden="true" className="font-mono text-[40px] leading-none text-accent">
				✓
			</div>
			<h2 className="m-0 font-mono text-[18px] font-semibold text-fg">메시지 전송됨</h2>
			<p className="m-0 font-mono text-[13px] leading-[1.7] text-muted">
				자동응답 메일이 발송되었습니다. 평균 회신 24시간.
			</p>
			<Link
				to="/"
				className="mt-2 inline-flex items-center gap-2 rounded-md border border-line-strong bg-transparent px-4 py-2 font-mono text-[12px] text-muted transition-colors duration-[var(--duration-120)] ease-out hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
			>
				<span aria-hidden="true">←</span>
				홈으로
			</Link>
		</section>
	);
}
