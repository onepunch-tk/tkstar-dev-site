import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"pre">;

export default function CodeBlock(props: Props) {
	return <pre className="codeblock" {...props} />;
}
