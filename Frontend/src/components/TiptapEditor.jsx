import React, { useState, useEffect, useRef } from "react";
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

const DEBOUNCE_MS = 800;

const TiptapEdited = ({ note, onNoteUpdated }) => {
  const [saveStatus, setSaveStatus] = useState("idle");
  const [uploadingImage, setUploadingImage] = useState(false);
  const saveTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const isTempNote = !note?.id || (typeof note.id === "string" && String(note.id).startsWith("temp-"));

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return null;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(
        'http://localhost:4000/upload-note-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      return res.data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Highlight,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write something brilliant..." }),
    ],
    content: note?.content ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-full p-6 text-gray-300 " +
               "[&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h3]:text-xl " +
               "[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 " +
               "[&_blockquote]:border-l-4 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic " +
               "[&_pre]:bg-[#2a2d30] [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:text-emerald-400 " +
               "[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4",
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith('image/'));

        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            const currentEditor = editorRef.current || editor;
            if (currentEditor) {
              handleImageUpload(file).then((url) => {
                if (url && currentEditor) {
                  currentEditor.chain().focus().setImage({ src: url }).run();
                }
              });
            }
          }
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
          event.preventDefault();
          const currentEditor = editorRef.current || editor;
          if (currentEditor) {
            handleImageUpload(imageFile).then((url) => {
              if (url && currentEditor) {
                currentEditor.chain().focus().setImage({ src: url }).run();
              }
            });
          }
          return true;
        }
        return false;
      },
    },
    onUpdate: () => {
      setSaveStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        if (!editor || isTempNote) {
          setSaveStatus("idle");
          return;
        }
        const json = editor.getJSON();
        setSaveStatus("saving");
        axios
          .patch(
            `http://localhost:4000/update-note/${note.id}`,
            { content: json },
            { withCredentials: true }
          )
          .then(() => {
            setSaveStatus("saved");
            onNoteUpdated?.(note.id, json);
            setTimeout(() => setSaveStatus("idle"), 2000);
          })
          .catch((err) => {
            console.error("Auto-save error:", err.response?.data || err.message);
            setSaveStatus("idle");
          });
      }, DEBOUNCE_MS);
    },
  });

  // Sync editor content when note changes (e.g. tab switch or external update)
  useEffect(() => {
    if (!editor || !note) return;
    const noteContent = note.content ?? "";
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(noteContent)) {
      editor.commands.setContent(noteContent);
    }
  }, [note?.id, editor]);

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (!editor) return null;

  const Btn = ({ onClick, active = false, children, title }) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      //title={title}
      className={`p-2 transition-all rounded hover:bg-white/10 ${active ? "text-emerald-400 bg-white/5" : "text-gray-400"}`}
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
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><FaHeading size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><FaListUl size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><FaListOl size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}><FaAlignLeft size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><FaAlignCenter size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><FaTerminal size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file).then((url) => {
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                });
              }
              e.target.value = ''; // Reset input
            }}
          />
          <Btn 
            onClick={() => fileInputRef.current?.click()}
            title="Insert Image"
          >
            {uploadingImage ? (
              <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            ) : (
              <FaImage size={12} />
            )}
          </Btn>
        </div>

        {/* STATUS INDICATOR */}
        <div className="ml-auto px-4">
          {saveStatus === "saving" && (
            <span className="text-[10px] text-amber-500 font-bold animate-pulse uppercase tracking-widest">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Saved</span>
          )}
        </div>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className="flex-1 overflow-y-auto cursor-text"
      onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEdited;