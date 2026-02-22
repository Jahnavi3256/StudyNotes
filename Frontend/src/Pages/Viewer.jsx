import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import TiptapEdited from "../components/TiptapEditor";
import { Trash2, AlertTriangle, Menu, Maximize2, Minimize2, MessageSquare, MessageSquareOff, FileText } from "lucide-react";
import CollaborationPanel from "../components/CollaborationPanel";

export default function Viewer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state with browser Escape key / other exits
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const [activeDocId, setActiveDocId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const { id } = useParams();
  const [docs, setDocs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const notebook = location.state.notebook;
  const fileInputRef = useRef(null);

  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [editingTabId, setEditingTabId] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Context Menu & Delete State
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, noteId: null });

  // ── Load notebook data ────────────────────────────────────────────────────
  useEffect(() => {
    async function loadNotebook() {
      try {
        const res = await axios.get(
          `http://localhost:4000/notebook/${id}`,
          { withCredentials: true }
        );
        setDocs(res.data.documents);

        if (res.data.notes.length > 0) {
          setNotes(res.data.notes);
          setCurrentNoteId(res.data.notes[0].id);
        } else {
          setNotes([]);
          setCurrentNoteId(null);
        }

        console.log(res.data.documents);
        console.log(res.data.notes);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNotebook();
  }, [id]);

  // ── Load current user ─────────────────────────────────────────────────────
  useEffect(() => {
    axios.get("http://localhost:4000/auth/me", { withCredentials: true })
      .then(res => {
        const u = res.data.user;
        setCurrentUser({
          ...u,
          // Normalise: backend returns full_name, editor expects name
          name: u.full_name || u.name || u.email || "User",
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        });
      })
      .catch(() => setCurrentUser({
        id: Math.floor(Math.random() * 10000),
        name: "User",
        color: '#10b981',
      }));
  }, []);

  const handleAddNote = async () => {
    if (notes.length >= 5) {
      alert("Maximum of 5 notes allowed. Please delete a note to add a new one.");
      return;
    }

    let nextNumber = 1;
    const existingTitles = notes.map(n => n.title);

    while (existingTitles.includes(`Untitled Note ${nextNumber}`)) {
      nextNumber++;
    }

    const newTitle = `Untitled Note ${nextNumber}`;

    const payload = {
      notebookId: id,
      title: newTitle,
      content: {}
    };

    setIsAddingNote(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/create-note",
        payload,
        { withCredentials: true }
      );

      const savedNote = res.data.note;
      setNotes(prev => [...prev, savedNote]);
      setCurrentNoteId(savedNote.id);

    } catch (err) {
      console.error("Failed to create note:", err.response?.data?.message || err.message);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRenameNote = async (noteId, newTitle) => {
    setEditingTabId(null);
    if (!newTitle.trim()) return;

    const isTempNote = typeof noteId === "string" && String(noteId).startsWith("temp-");
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, title: newTitle.trim() } : n));

    if (isTempNote) return;
    try {
      await axios.put(`http://localhost:4000/rename-note/${noteId}`, { title: newTitle.trim() }, { withCredentials: true });
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  // ── Context Menu & Delete Handlers ────────────────────────────────────────
  const handleContextMenu = useCallback((e, noteId) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, noteId });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [closeContextMenu]);

  const handleDeleteClick = () => {
    if (contextMenu) {
      setDeleteConfirmation({ isOpen: true, noteId: contextMenu.noteId });
      closeContextMenu();
    }
  };

  const handleDeleteConfirm = async () => {
    const noteIdToDelete = deleteConfirmation.noteId;
    if (!noteIdToDelete) return;

    try {
      await axios.delete(`http://localhost:4000/delete-note/${noteIdToDelete}`, {
        withCredentials: true
      });

      setNotes(prev => {
        const newNotes = prev.filter(n => n.id !== noteIdToDelete);
        if (currentNoteId === noteIdToDelete) {
          setCurrentNoteId(newNotes.length > 0 ? newNotes[0].id : null);
        }
        return newNotes;
      });

    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note");
    } finally {
      setDeleteConfirmation({ isOpen: false, noteId: null });
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("notebookId", notebook.id);

      try {
        const response = await axios.post("http://localhost:4000/upload-doc", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        });
        console.log("Upload Success:", response.data);
      } catch (error) {
        console.error("Upload Error:", error);
      }
    }
  };

  // ── Resizing Logic ────────────────────────────────────────────────────────
  const [pdfWidth, setPdfWidth] = useState(40);
  const isResizing = useRef(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = 'none');
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = 'auto');
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    const sidebarWidth = isSidebarOpen ? 112 : 0;
    const availableWidth = window.innerWidth - sidebarWidth;
    const newLeftWidth = e.clientX - sidebarWidth;
    const newPercentage = (newLeftWidth / availableWidth) * 100;
    if (newPercentage > 15 && newPercentage < 80) {
      setPdfWidth(newPercentage);
    }
  }, [isSidebarOpen]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-3 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium tracking-wide">Loading notebook...</p>
        </div>
      </div>
    );
  }

  const activeDocument = docs.find(d => (d.id === activeDocId || d._id === activeDocId));
  const pdfUrl = activeDocument ? activeDocument.file_url : null;

  return (
    <div className="w-screen h-screen bg-gray-100 text-gray-800 flex flex-col font-sans selection:bg-indigo-500/30">

      {/* COLLABORATION PANEL */}
      <CollaborationPanel
        notebookId={id}
        currentUser={currentUser}
        isOpen={isCollaborationOpen}
        onClose={() => setIsCollaborationOpen(prev => !prev)}
      />

      {/* HEADER */}
      <header className="h-8 flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2 text-sm border-l border-gray-200 pl-4">
            <span className="text-gray-500">{notebook.title}</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">{docs.find(d => d.id === activeDocId)?.filename || 'No document'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chat toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            title={showChat ? "Hide Chat" : "Show Chat"}
            className={`p-1.5 rounded-lg transition-colors ${showChat ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            {showChat ? <MessageSquare size={15} /> : <MessageSquareOff size={15} />}
          </button>
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* MAIN VIEW */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* COLLAPSIBLE SIDEBAR */}
        <aside
          className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? "w-28 opacity-100" : "w-0 opacity-0"}`}
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="group flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => setActiveDocId(doc.id)}
              >
                <div className={`relative w-full aspect-[3/4] rounded-xl flex items-center justify-center overflow-hidden border transition-all duration-300 ${activeDocId === doc.id
                  ? "border-indigo-500 bg-white shadow-[0_8px_30px_rgb(79,70,229,0.12)] scale-[1.02]"
                  : "border-gray-200 bg-gray-50 group-hover:border-indigo-200 group-hover:bg-white group-hover:shadow-md"
                  }`}>
                  <FileText
                    size={28}
                    className={`transition-colors duration-300 ${activeDocId === doc.id ? "text-indigo-500" : "text-gray-300 group-hover:text-indigo-300"}`}
                    strokeWidth={1.5}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
                <span className={`text-[10px] truncate w-full text-center px-1 transition-colors ${activeDocId === doc.id ? "text-indigo-600 font-semibold" : "text-gray-500 group-hover:text-gray-700"}`}>
                  {doc.filename}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 mt-auto border-t border-gray-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx"
            />
            <button
              className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-300 text-gray-400 group relative overflow-hidden"
              onClick={handleButtonClick}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <span className="text-xl font-light text-gray-400 group-hover:text-indigo-500">+</span>
                </div>
                <span className="text-[10px] font-medium opacity-80 group-hover:opacity-100 group-hover:text-indigo-600">Add Doc</span>
              </div>
            </button>
          </div>
        </aside>

        {/* PDF VIEWER */}
        <section
          style={{ width: `${pdfWidth}%` }}
          className="bg-gray-200 flex flex-col items-center overflow-hidden border-r border-gray-200"
        >
          {pdfUrl ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              className="w-full h-full border-none"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 18h12V6h-4V2H4v16zm-2 1V1h11l5 5v13a1 1 0 01-1 1H3a1 1 0 01-1-1z" />
              </svg>
              <p className="text-xs uppercase tracking-widest opacity-50">Select a document to preview</p>
            </div>
          )}
        </section>

        {/* RESIZER HANDLE */}
        <div
          onMouseDown={startResizing}
          className="w-1 hover:w-1.5 transition-all bg-transparent hover:bg-indigo-500 cursor-col-resize active:bg-indigo-500 z-10 flex-shrink-0 relative group"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gray-200 group-hover:bg-transparent" />
        </div>

        {/* EDITOR SECTION */}
        <section className="flex-1 bg-white relative min-w-0 flex flex-col">

          {/* TABS BAR */}
          <div className="h-8 flex items-center bg-gray-50 border-b border-gray-200 overflow-x-auto shrink-0 scrollbar-hide">
            {notes.map((note) => (
              <div
                key={note.id}
                onContextMenu={(e) => handleContextMenu(e, note.id)}
                onDoubleClick={() => setEditingTabId(note.id)}
                onClick={() => setCurrentNoteId(note.id)}
                className={`group flex items-center gap-2 px-2 py-0 h-full cursor-pointer border-r border-gray-200 min-w-[100px] transition-all relative ${currentNoteId === note.id
                  ? "bg-white text-indigo-600 border-t-2 border-t-indigo-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {editingTabId === note.id ? (
                  <input
                    autoFocus
                    className="bg-transparent outline-none border-b border-indigo-500 w-full text-xs text-gray-900"
                    defaultValue={note.title}
                    onBlur={(e) => handleRenameNote(note.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameNote(note.id, e.target.value)}
                  />
                ) : (
                  <>
                    <span className="text-[11px] truncate select-none font-medium flex-1">{note.title || "Untitled Note"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation({ isOpen: true, noteId: note.id });
                      }}
                      style={{ padding: "0.3em 0.5em" }}
                      className="opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all"
                      title="Delete Note"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
            <button
              className="p-2 px-4 text-gray-400 hover:text-indigo-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddNote}
              disabled={isAddingNote}
            >
              {isAddingNote ? (
                <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              ) : (
                "+"
              )}
            </button>
          </div>

          {/* EDITOR INSTANCES */}
          <div className="flex-1 relative">
            {isAddingNote ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-3 border-emerald-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-3 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-400 text-xs font-medium">Creating note...</p>
                </div>
              </div>
            ) : notes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-gray-500 text-sm font-medium">No notes yet</p>
                  <p className="text-gray-600 text-xs">Click + to add your first note</p>
                </div>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`absolute inset-0 ${currentNoteId === note.id
                    ? "opacity-100 z-20 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                    }`}
                >
                  {currentNoteId === note.id && currentUser && (
                    <TiptapEdited
                      note={note}
                      currentUser={currentUser}
                      onNoteUpdated={(updatedNoteId, content) => {
                        setNotes((prev) =>
                          prev.map((n) => (n.id === updatedNoteId ? { ...n, content } : n))
                        );
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* CHAT PANEL — right side */}
        <aside
          className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${showChat ? "w-72 opacity-100" : "w-0 opacity-0"}`}
        >
          <div className="h-8 flex items-center px-4 border-b border-gray-100 shrink-0">
            <span className="text-[9px] font-black text-indigo-600/80 uppercase tracking-[0.2em]">AI Contextual Engine</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="bg-indigo-50 text-indigo-900 p-3 rounded-2xl rounded-tl-none text-xs border border-indigo-100">
              Reviewing <strong>{docs.find(d => d.id === activeDocId)?.filename || 'document'}</strong>. Ask me anything about the content or context.
            </div>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl text-xs max-w-[90%] ${msg.role === "user"
                  ? "ml-auto bg-indigo-600 text-white rounded-tr-none"
                  : "bg-gray-100 text-gray-700 rounded-tl-none"
                  }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2 items-center shrink-0">
            <input
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 placeholder:text-gray-400"
              placeholder="Ask anything..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && chatInput.trim()) {
                  setChatMessages(prev => [...prev, { role: "user", text: chatInput.trim() }]);
                  setChatInput("");
                }
              }}
            />
            <button
              className="bg-indigo-600 text-white text-xs font-bold rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors shrink-0"
              onClick={() => {
                if (chatInput.trim()) {
                  setChatMessages(prev => [...prev, { role: "user", text: chatInput.trim() }]);
                  setChatInput("");
                }
              }}
            >
              Send
            </button>
          </div>
        </aside>

        {/* CONTEXT MENU */}
        {contextMenu && (
          <div
            className="fixed bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50 min-w-[120px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDeleteClick}
              className="w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Note?</h3>
              <p className="text-sm text-center text-gray-500 mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, noteId: null })}
                  className="w-full py-2 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
