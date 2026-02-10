import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import axios from "axios";
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough, FaUndo, FaRedo,
  FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaImage, FaTerminal, FaHeading, FaPlus, FaTimes
} from "react-icons/fa";

const TiptapEdited = ({ note, allNotes }) => {
  // Manage multiple tabs/notes in local state
  const [tabs, setTabs] = useState([note]);
  const [activeTabId, setActiveTabId] = useState(note?._id);

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
      Placeholder.configure({ placeholder: "Write something brilliant..." }),
    ],
    content: note?.content || "",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-full p-6 text-gray-300 " +
               "[&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h3]:text-xl " +
               "[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 " +
               "[&_blockquote]:border-l-4 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic " +
               "[&_pre]:bg-[#2a2d30] [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:text-emerald-400",
      },
    },
  });

  // Update editor content when active tab changes
  useEffect(() => {
    if (editor && activeTabId) {
      const activeNote = tabs.find(t => t._id === activeTabId);
      editor.commands.setContent(activeNote?.content || "");
    }
  }, [activeTabId, editor]);

  const addNewNote = () => {
    const newNote = {
      _id: Date.now().toString(), // Temporary ID until saved to DB
      title: "Untitled Note",
      content: ""
    };
    setTabs([...tabs, newNote]);
    setActiveTabId(newNote._id);
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    const filteredTabs = tabs.filter(t => t._id !== id);
    setTabs(filteredTabs);
    if (activeTabId === id && filteredTabs.length > 0) {
      setActiveTabId(filteredTabs[filteredTabs.length - 1]._id);
    }
  };

  const saveEditedContent = async () => {
    try {
      const json = editor.getJSON();
      await axios.put(`http://localhost:4000/api/notes/${activeTabId}`, { content: json });
      if (allNotes) await allNotes();
      alert("Note Saved!");
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (!editor) return null;

  const Btn = ({ onClick, active = false, children, title }) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-2 transition-all rounded hover:bg-white/10 ${active ? "text-emerald-400 bg-white/5" : "text-gray-400"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#121212] border-l border-white/10 overflow-hidden">
      
      {/* TABS BAR (Notepad/Browser style) */}
      <div className="flex items-center bg-[#0d0d0d] overflow-x-auto scrollbar-hide border-b border-white/10">
        {tabs.map((t) => (
          <div
            key={t._id}
            onClick={() => setActiveTabId(t._id)}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-white/5 min-w-[120px] max-w-[200px] transition-colors ${
              activeTabId === t._id ? "bg-[#1a1b1e] text-emerald-400 border-t-2 border-t-emerald-500" : "text-gray-500 hover:bg-white/5"
            }`}
          >
            <span className="truncate text-xs font-medium">{t.title || "Untitled"}</span>
            <FaTimes 
                size={10} 
                className="hover:text-red-400 mt-0.5" 
                onClick={(e) => closeTab(e, t._id)}
            />
          </div>
        ))}
        <button 
          onClick={addNewNote}
          className="p-3 text-gray-500 hover:text-white transition-colors"
        >
          <FaPlus size={12} />
        </button>
      </div>

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
        </div>

        <button
          onClick={saveEditedContent}
          className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-colors"
        >
          Save Tab
        </button>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEdited;