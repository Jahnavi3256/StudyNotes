import React, { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Heading from "@tiptap/extension-heading";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Image as ImageIcon,
  Video,
  List,
  ListOrdered,
  Link as LinkIcon,
  PaintBucket,
  Copy,
  Download,
} from "lucide-react";

import "./styles.css";

export default function RichTextEditor({ value, onChange, dark = false }) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: true, orderedList: true }),
      Underline,
      Placeholder.configure({ placeholder: "Write something…" }),
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: true }),
      Youtube.configure({ controls: true }),
      TextStyle,
      Color,
      Highlight,
      Heading.configure({ levels: [1, 2, 3, 4, 5] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: dark ? "editor dark" : "editor",
      },
    },
  });

  if (!editor) return null;

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editor
        .chain()
        .focus()
        .setImage({ src: reader.result, width: 200, height: 200 })
        .run();
    };
    reader.readAsDataURL(file);
  };

  const addYoutube = () => {
    const url = prompt("YouTube URL");
    if (!url) return;

    editor
      .chain()
      .focus()
      .setYoutubeVideo({
        src: url.replace("watch?v=", "embed/"),
        width: 400,
        height: 250,
      })
      .run();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editor.getHTML());
    alert("Copied!");
  };

  const downloadText = () => {
    const blob = new Blob([editor.getHTML()], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.html";
    a.click();
  };

  return (
    <div className={dark ? "rte-container dark" : "rte-container"}>
      <div className="toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon /></button>

        <select onChange={(e) => editor.chain().focus().toggleHeading({ level: +e.target.value }).run()}>
          <option value={0}>Paragraph</option>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <option key={lvl} value={lvl}>Heading {lvl}</option>
          ))}
        </select>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></button>

        <button onClick={() => fileInputRef.current.click()}><ImageIcon /></button>
        <input hidden ref={fileInputRef} type="file" accept="image/*" onChange={uploadImage} />

        <button onClick={addYoutube}><Video /></button>

        <input type="color" onInput={(e) => editor.chain().focus().setColor(e.target.value).run()} />

        <button onClick={() => editor.chain().focus().toggleHighlight().run()}><PaintBucket /></button>

        <button
          onClick={() => {
            const url = prompt("Enter link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon />
        </button>

        <button onClick={copyToClipboard}><Copy /></button>
        <button onClick={downloadText}><Download /></button>
      </div>

      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
