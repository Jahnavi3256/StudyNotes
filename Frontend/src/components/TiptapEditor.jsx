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

// ─── Helper ───────────────────────────────────────────────────────────────────
function isContentEmpty(content) {
  if (!content) return true;
  if (typeof content === 'string') return content.trim() === '';
  if (content?.type === 'doc') {
    const inner = content.content;
    if (!inner || inner.length === 0) return true;
    if (inner.length === 1 && inner[0].type === 'paragraph' && !inner[0].content) return true;
  }
  return false;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TiptapEdited = ({ note, onNoteUpdated, currentUser }) => {
  const [saveStatus, setSaveStatus] = useState("idle");
  const [activeUsers, setActiveUsers] = useState([]);
  const [connStatus, setConnStatus] = useState("connecting");
  const [uploadingImage, setUploadingImage] = useState(false);
  const providerRef = useRef(null);

  const fileInputRef = useRef(null);
  const saveTimerRef = useRef(null);
  const seededRef = useRef(false);

  const isSeedingContent = useRef(false);
  const isTempNote = !note?.id || (typeof note.id === "string" && note.id.startsWith("temp-"));

  // ── 1. Create Y.js doc ONCE and keep it stable ───────────────────────────
  const ydoc = useMemo(() => new Y.Doc(), [note.id]);
  const ydocRef = useRef(ydoc);

  // ── 2. Create/destroy Hocuspocus provider per note.id ────────────────────
  useEffect(() => {
    seededRef.current = false;

    if (isTempNote) {
      setConnStatus("disconnected");
      return;
    }

    const provider = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: `note-${note.id}`,
      document: ydoc,
      token: '',

      onStatus({ status }) {
        setConnStatus(status);
      },

      onSynced() {
        if (seededRef.current) return;
        seededRef.current = true;
        const xmlFragment = ydoc.getXmlFragment('default');
        if (xmlFragment.length === 0 && !isContentEmpty(note.content)) {
          document.dispatchEvent(
            new CustomEvent('hocus-seed', {
              detail: { noteId: note.id, content: note.content }
            })
          );
        }
      },

      onAuthenticationFailed() {
        console.error('Hocuspocus auth failed');
        setConnStatus('disconnected');
      },
    });

    providerRef.current = provider;

    // ── Track active users via awareness ─────────────────────────────
    provider.setAwarenessField('user', {
      name: currentUser?.name || 'Anonymous',
      color: currentUser?.color || '#10b981',
    });

    const updateActiveUsers = () => {
      const states = Array.from(provider.awareness.getStates().entries())
        .filter(([clientId, state]) => clientId !== provider.awareness.clientID)
        .map(([clientId, state]) => ({
          clientId,
          name: state.user?.name || 'Anonymous',
          color: state.user?.color || '#10b981',
        }));
      setActiveUsers(states);
    };

    provider.awareness.on('change', updateActiveUsers);
    updateActiveUsers();

    return () => {
      clearTimeout(saveTimerRef.current);
      provider.awareness.off('change', updateActiveUsers);
      provider.destroy();
    };
  }, [note.id, ydoc, currentUser]);

  // ── 3. Image upload ───────────────────────────────────────────────────────
  const handleImageUpload = async (file) => {
    if (!file?.type.startsWith("image/")) {
      alert("Please select an image file");
      return null;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(
        "http://localhost:4000/upload-note-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      return res.data.url;
    } catch {
      alert("Failed to upload image.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // ── 4. Build editor ──────────────────────────────────────────────────────
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
          link: false,
        }),
        Underline,
        TextStyle,
        FontFamily,
        Highlight,
        ImageExtension.configure({ inline: false, allowBase64: false }),
        AudioExtension,
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder: "Write something brilliant..." }),
        Collaboration.configure({
          document: ydoc,
        }),
      ],

      editorProps: {
        attributes: {
          class:
            "prose max-w-none focus:outline-none min-h-full p-6 text-gray-900 " +
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h3]:text-lg " +
            "[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 " +
            "[&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic " +
            "[&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:text-indigo-600 " +
            "[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4",
        },
        handlePaste(view, event) {
          const imageItem = Array.from(event.clipboardData?.items || [])
            .find(i => i.type.startsWith("image/"));
          if (imageItem) {
            event.preventDefault();
            const file = imageItem.getAsFile();
            if (file) handleImageUpload(file).then(url => {
              if (url) editor?.chain().focus().setImage({ src: url }).run();
            });
            return true;
          }
          return false;
        },
        handleDrop(view, event) {
          const imageFile = Array.from(event.dataTransfer?.files || [])
            .find(f => f.type.startsWith("image/"));
          if (imageFile) {
            event.preventDefault();
            handleImageUpload(imageFile).then(url => {
              if (url) editor?.chain().focus().setImage({ src: url }).run();
            });
            return true;
          }
          return false;
        },
      },
    },
    [note.id, ydoc]
  );

  // ── 5. Listen for seed event ──────────────────────────────────────────────
  useEffect(() => {
    if (!editor) return;

    const handleSeed = (e) => {
      if (e.detail.noteId !== note.id) return;
      setTimeout(() => {
        isSeedingContent.current = true;
        editor.commands.setContent(e.detail.content);
        setTimeout(() => {
          isSeedingContent.current = false;
        }, 0);
      }, 50);
    };

    document.addEventListener('hocus-seed', handleSeed);
    return () => document.removeEventListener('hocus-seed', handleSeed);
  }, [editor, note.id]);

  // ── 6. Auto-save on Y.js updates ──────────────────────────────────────────
  useEffect(() => {
    if (!editor || isTempNote) return;

    const handleUpdate = (update, origin) => {
      // If the update comes from the websocket provider (remote change), don't trigger save
      if (origin === providerRef.current) return;
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
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (err) {
          console.error("Save error:", err.response?.data || err.message);
          setSaveStatus("idle");
        }
      }, 1500);
    };

    ydoc.on("update", handleUpdate);
    return () => ydoc.off("update", handleUpdate);
  }, [editor, note.id, ydoc]);

  if (!editor) return null;

  // ── Toolbar button ────────────────────────────────────────────────────────
  const Btn = ({ onClick, active = false, children, title }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-2 transition-all rounded hover:bg-gray-100 ${active ? "text-indigo-600 bg-indigo-50" : "text-gray-500"
        }`}
    >
      {children}
    </button>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-gray-200 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><FaUndo size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><FaRedo size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <Btn onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}><FaBold size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}><FaItalic size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}><FaUnderline size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}><FaHeading size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}><FaListUl size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}><FaListOl size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}><FaAlignLeft size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}><FaAlignCenter size={12} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}><FaTerminal size={12} /></Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <Btn
            onClick={() => editor.chain().focus().insertContent('<audio-component />').run()}
            title="Add Audio Note"
          >
            <FaMicrophone size={12} />
          </Btn>
        </div>

        <div className="flex items-center gap-0.5 px-1">
          <input
            type="file" ref={fileInputRef} accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file).then(url => {
                if (url) editor.chain().focus().setImage({ src: url }).run();
              });
              e.target.value = "";
            }}
          />
          <Btn onClick={() => fileInputRef.current?.click()} title="Insert Image">
            {uploadingImage
              ? <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              : <FaImage size={12} />
            }
          </Btn>
        </div>

        <div className="ml-auto flex items-center gap-3 px-4">
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-1.5 mr-2 border-r border-gray-200 pr-3">
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.clientId}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              {activeUsers.length > 3 && (
                <span className="text-[10px] text-gray-500 font-medium">
                  +{activeUsers.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${connStatus === "connected" ? "bg-indigo-500" :
              connStatus === "connecting" ? "bg-amber-500 animate-pulse" : "bg-red-500"
              }`} />
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">
              {connStatus}
            </span>
          </div>

          {saveStatus === "saving" && (
            <span className="text-[10px] text-amber-500 font-bold animate-pulse uppercase tracking-widest">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Saved ✓</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEdited;
