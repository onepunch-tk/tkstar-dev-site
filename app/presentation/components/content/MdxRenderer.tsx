import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

/**
 * @internal SECURITY-CRITICAL — `code` MUST be a build-time velite mdx output (function-body source).
 * Trusted source: `#content/{projects,posts,legal}` JSON `body` field.
 * Do NOT pass user-supplied or runtime-fetched strings — adding such a call site is RCE-equivalent.
 */
const evaluateMdxBody = (code: string) => {
	const fn = new Function(code);
	return fn({ Fragment, jsx, jsxs }).default;
};

type Props = { code: string };

export default function MdxRenderer({ code }: Props) {
	const Content = evaluateMdxBody(code);
	return <Content />;
}
