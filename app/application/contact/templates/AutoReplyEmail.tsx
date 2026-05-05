import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";

interface AutoReplyEmailProps {
	name: string;
}

export default function AutoReplyEmail({ name }: AutoReplyEmailProps) {
	return (
		<Html lang="ko">
			<Head />
			<Preview>tkstar.dev 컨택 문의가 정상 접수되었습니다.</Preview>
			<Body style={{ fontFamily: "ui-monospace, monospace", padding: 24 }}>
				<Container>
					<Section>
						<Text>{name} 님, 안녕하세요.</Text>
						<Text>
							tkstar.dev 컨택 폼으로 보내주신 문의가 정상 접수되었습니다.
							<br />
							가능한 빨리 회신드리겠습니다.
						</Text>
						<Text>— tkstarDev (TaekyungHa)</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
