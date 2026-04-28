import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

const evaluateMdxBody = (code: string) => {
	const fn = new Function(code);
	return fn({ Fragment, jsx, jsxs }).default;
};

type Props = { code: string };

export default function MdxRenderer({ code }: Props) {
	const Content = evaluateMdxBody(code);
	return <Content />;
}
