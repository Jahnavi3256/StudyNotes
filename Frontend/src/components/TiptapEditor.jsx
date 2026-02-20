import React, { useState, useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "./Extensions/ImageExtension";
import AudioExtension from "./Extensions/AudioExtension";
import { Collaboration } from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import axios from "axios";
import {
  FaBold, FaItalic, FaUnderline, FaUndo, FaRedo,
  FaListUl, FaListOl, FaAlignLeft, FaAlignCenter,
  FaImage, FaTerminal, FaHeading, FaMicrophone,
} from "react-icons/fa";

const TiptapEdited = ({ note, onNoteUpdated, currentUser }) => {
  const [saveStatus, setSaveStatus] = useState("idle");
  const [connStatus, setConnStatus] = useState("connecting");
  const [uploadingImage, setUploadingImage] = useState(false);

  const providerRef = useRef(null);
  const fileInputRef = useRef(null);
  const saveTimerRef = useRef(null);
  const isSeedingContent = useRef(false);

  const isTempNote =
    !note?.id || (typeof note.id === "string" && note.id.startsWith("temp-"));

  const ydoc = useMemo(() => new Y.Doc(), [note.id]);

  // ── Provider ─────────────────────────────────────────
  useEffect(() => {
    if (isTempNote) {
      setConnStatus("disconnected");
      return;
    }

    const provider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: `note-${note.id}`,
      document: ydoc,
      token: "",
      onStatus({ status }) {
        setConnStatus(status);
      },
    });

    providerRef.current = provider;

    provider.setAwarenessField("user", {
      name: currentUser?.name || "Anonymous",
      color: currentUser?.color || "#10b981",
    });

    return () => {
      clearTimeout(saveTimerRef.current);
      provider.destroy();
    };
  }, [note.id, ydoc, currentUser]);

  // ── Image Upload ─────────────────────────────────────
  const handleImageUpload = async (file) => {
    if (!file?.type.startsWith("image/")) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        "http://localhost:4000/upload-note-image",
        formData,
        { withCredentials: true }
      );

      return res.data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Editor ───────────────────────────────────────────
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ history: false }),
        Underline,
        TextStyle,
        FontFamily,
        Highlight,
        ImageExtension,
        AudioExtension,
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder: "Write something brilliant..." }),
        Collaboration.configure({ document: ydoc }),
      ],
    },
    [note.id]
  );

  // ── Autosave ─────────────────────────────────────────
  useEffect(() => {
    if (!editor || isTempNote) return;

    const handleUpdate = () => {
      if (isSeedingContent.current) return;

      setSaveStatus("saving");
      clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        try {
          const json = editor.getJSON();

          await axios.patch(
            `http://localhost:4000/update-note/${note.id}`,
            { content: json },
            { withCredentials: true }
          );

          setSaveStatus("saved");
          onNoteUpdated?.(note.id, json);
        } catch {
          setSaveStatus("idle");
        }
      }, 1200);
    };

    editor.on("update", handleUpdate);
    return () => editor.off("update", handleUpdate);
  }, [editor, note.id]);

  if (!editor) return null;

  // ── Toolbar Button ───────────────────────────────────
  const Btn = ({ onClick, active = false, children, title }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      style={{ padding: "0.6em 0.5em" }}
      className={`shrink-0 flex items-center justify-center
        transition-all rounded-[3px] hover:bg-gray-200/40 ${active ? "text-indigo-600" : "text-gray-500"
        }`}
    >
      <span
        className={`flex items-center justify-center rounded-[3px] ${active ? "bg-indigo-100/60 p-[2px]" : ""
          }`}
      >
        {children}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-gray-200 overflow-hidden">

      {/* TOOLBAR */}
      <div className="flex items-center gap-0 px-1 py-0.5 bg-gray-50 border-b border-gray-200 overflow-x-auto">

        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <FaUndo size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <FaRedo size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <FaBold size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <FaItalic size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <FaUnderline size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading">
          <FaHeading size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <FaListUl size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <FaListOl size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <FaAlignLeft size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <FaAlignCenter size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <FaTerminal size={12} />
        </Btn>

        <Btn onClick={() => editor.chain().focus().insertContent("<audio-component />").run()} title="Audio Note">
          <FaMicrophone size={12} />
        </Btn>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file)
              handleImageUpload(file).then((url) => {
                if (url) editor.chain().focus().setImage({ src: url }).run();
              });
          }}
        />

        <Btn onClick={() => fileInputRef.current?.click()} title="Insert Image">
          {uploadingImage ? (
            <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaImage size={12} />
          )}
        </Btn>

        {/* Status — inline, right-aligned */}
        <div className="ml-auto flex items-center gap-2 px-2 text-[10px] text-gray-400 shrink-0">
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${connStatus === "connected"
                ? "bg-indigo-500"
                : connStatus === "connecting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-500"
                }`}
            />
            <span className="uppercase tracking-widest">{connStatus}</span>
          </div>
          {saveStatus === "saving" && (
            <span className="text-amber-500 font-bold animate-pulse">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-indigo-500 font-bold">Saved ✓</span>
          )}
        </div>
      </div>

      {/* EDITOR */}
      <div
        className="flex-1 overflow-y-auto cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEdited;