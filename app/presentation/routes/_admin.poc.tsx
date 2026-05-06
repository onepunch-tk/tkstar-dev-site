// T023 PoC — Tiptap admin route stub for client bundle measurement only.
// Reverted in T7. Do NOT reference from other code.
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function AdminPocRoute() {
	const editor = useEditor({
		extensions: [StarterKit],
		content: "<p>Hello PoC</p>",
		immediatelyRender: false,
	});
	return (
		<div className="prose">
			<EditorContent editor={editor} />
		</div>
	);
}
