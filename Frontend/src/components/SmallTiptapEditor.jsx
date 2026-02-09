import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import axios from "axios";
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaUndo, FaRedo
} from "react-icons/fa";

const SmallTiptapEditor = ({ note, editing, setEditing, allNotes }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Write your note here...",
      }),
    ],
    content: note?.content || "",
    editorProps: {
      attributes: {
        // Simplified prose classes
        class: "prose prose-invert max-w-none focus:outline-none min-h-full p-6 text-gray-300 " +
               "[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4",
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
      {/* MINIMALIST TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#1a1b1e] border-b border-white/5 shadow-xl">
        {/* History Group */}
        <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><FaUndo size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><FaRedo size={12} /></Btn>
        </div>

        {/* Formatting Group */}
        <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
          <Btn 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            active={editor.isActive("bold")}
            title="Bold"
          >
            <FaBold size={12} />
          </Btn>
          <Btn 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            active={editor.isActive("italic")}
            title="Italic"
          >
            <FaItalic size={12} />
          </Btn>
          <Btn 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            active={editor.isActive("underline")}
            title="Underline"
          >
            <FaUnderline size={12} />
          </Btn>
          <Btn 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <FaStrikethrough size={12} />
          </Btn>
        </div>

        {/* Lists Group */}
        <div className="flex items-center gap-0.5 px-1">
          <Btn 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <FaListUl size={12} />
          </Btn>
          <Btn 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <FaListOl size={12} />
          </Btn>
        </div>

        <button
          onClick={saveEditedContent}
          className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-colors"
        >
          Save Note
        </button>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <EditorContent editor={editor} />
      </div>

      {/* FOOTER */}
      <div className="px-4 py-2 border-t border-white/5 bg-[#1a1b1e] flex justify-between items-center">
        <span className="text-[10px] text-gray-500 uppercase font-medium italic">Essential Editor Mode</span>
        <span className="text-[10px] text-gray-500 uppercase font-medium">
          {editor.getText().length} Characters
        </span>
      </div>
    </div>
  );
};

export default SmallTiptapEditor;