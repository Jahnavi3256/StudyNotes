import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {TextStyle} from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import axios from "axios";
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough, FaCode,
  FaListUl, FaListOl, FaQuoteLeft, FaUndo, FaRedo,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaImage, FaTerminal, FaHeading
} from "react-icons/fa";

const TiptapEdited = ({ note, editing, setEditing, allNotes }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Highlight,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Reviewing Data_Analysis.pdf. Ask me anything...",
      }),
    ],
    content: note?.content || "",
    editorProps: {
      attributes: {
        // This handles all the "tiptap" class styling via Tailwind's typography-like approach
        class: "prose prose-invert max-w-none focus:outline-none min-h-full p-6 text-gray-300 " +
               "[&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h3]:text-xl " +
               "[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 " +
               "[&_blockquote]:border-l-4 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic " +
               "[&_pre]:bg-[#2a2d30] [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:text-emerald-400",
      },
    },
  });

  const saveEditedContent = async () => {
    try {
      const html = editor.getHTML();
      await axios.put(`http://localhost:5000/api/notes/${note._id}`, { content: html });
      if (allNotes) await allNotes();
      setEditing(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (!editor) return null;

  // Custom Button Helper
  const Btn = ({ onClick, active = false, children, title }) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-2 transition-all rounded hover:bg-white/10 ${
        active ? "text-emerald-400 bg-white/5" : "text-gray-400"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#121212] border-l border-white/10 overflow-hidden">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#1a1b1e] border-b border-white/5 shadow-xl">
        <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
          <Btn onClick={() => editor.chain().focus().undo().run()}><FaUndo size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()}><FaRedo size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><FaBold size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><FaItalic size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><FaUnderline size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><FaStrikethrough size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><FaHeading size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><FaListUl size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><FaListOl size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1">
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}><FaAlignLeft size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><FaAlignCenter size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><FaTerminal size={12} /></Btn>
          <Btn onClick={() => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}><FaImage size={12} /></Btn>
        </div>

        <button
          onClick={saveEditedContent}
          className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-colors"
        >
          Save Note
        </button>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <EditorContent editor={editor} />
      </div>

      {/* FOOTER STATS (Optional, adds to the functional look) */}
      <div className="px-4 py-2 border-t border-white/5 bg-[#1a1b1e] flex justify-between items-center">
        <span className="text-[10px] text-gray-500 uppercase font-medium">Editor Mode: Active</span>
        <span className="text-[10px] text-gray-500 uppercase font-medium">
          {editor.storage.characterCount?.words?.() || 0} Words
        </span>
      </div>
    </div>
  );
};

export default TiptapEdited;