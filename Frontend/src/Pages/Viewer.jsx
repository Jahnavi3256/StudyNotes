import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TiptapEdited from "../components/TiptapEditor";
import { useLocation } from "react-router-dom";
import { Trash2, AlertTriangle } from "lucide-react";

export default function Viewer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDocId, setActiveDocId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentNote, setCurrentNote] = useState(1);
  const [isEditing, setIsEditing] = useState(true);
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
      .then(res => setCurrentUser({
        ...res.data.user,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      }))
      .catch(() => setCurrentUser({
        id: Math.floor(Math.random() * 10000), // random ID for anonymous users
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
        // If we deleted the active note, switch to another one
        if (currentNoteId === noteIdToDelete) {
          if (newNotes.length > 0) {
            setCurrentNoteId(newNotes[0].id);
          } else {
            setCurrentNoteId(null);
          }
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
      console.log("Selected file:", file.name);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("notebookId", notebook.id);
      console.log(formData);

      try {
        const response = await axios.post("http://localhost:4000/upload-doc", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
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
        {/* CONTEXT MENU */}

      </div>
    );
  }

  const activeDocument = docs.find(d => (d.id === activeDocId || d._id === activeDocId));
  const pdfUrl = activeDocument ? activeDocument.file_url : null;

  return (
    <div className="w-screen h-screen bg-gray-100 text-gray-800 flex flex-col font-sans selection:bg-indigo-500/30">

      {/* HEADER */}
      <header className="h-8 flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="flex items-center gap-2 text-sm border-l border-gray-200 pl-4">
            <span className="text-gray-500">{notebook.title}</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">{docs.find(d => d.id === activeDocId)?.filename || 'No document'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${showChat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>
        </div>
      </header>

      {/* MAIN VIEW */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* COLLAPSIBLE SIDEBAR */}
        <aside
          className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? "w-28 opacity-100" : "w-0 opacity-0"
            }`}
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="group flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => setActiveDocId(doc.id)}>
                <div className={`relative w-full aspect-3/4 rounded-lg overflow-hidden border-2 transition-all duration-200 ${activeDocId === doc.id ? "border-indigo-500 shadow-lg shadow-indigo-500/10" : "border-gray-200 group-hover:border-indigo-200"
                  } ${doc.color}`}>
                  <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                </div>
                <span className={`text-[10px] truncate w-full text-center px-1 transition-colors ${activeDocId === doc.id ? "text-indigo-600 font-bold" : "text-gray-500 group-hover:text-gray-700"
                  }`}>
                  {doc.filename}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 h-24 border-t border-gray-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx"
            />
            <button
              className="w-full h-[87%] rounded-lg border border-dashed border-gray-300 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-400 transition-all text-gray-500 hover:text-indigo-600 gap-0"
              onClick={handleButtonClick}
            >
              <span className="text-xl pl-1">+</span>
              <span className="text-[11px]">Add Document</span>
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
        <section className="flex-1 bg-white relative min-w-0">

          {/* TABS BAR */}
          <div className="flex items-center bg-gray-50 border-b border-gray-200 overflow-x-auto shrink-0 scrollbar-hide">
            {notes.map((note) => (
              <div
                key={note.id}
                onContextMenu={(e) => handleContextMenu(e, note.id)}
                onDoubleClick={() => setEditingTabId(note.id)}
                onClick={() => setCurrentNoteId(note.id)}
                className={`group flex items-center gap-3 px-4 py-2 cursor-pointer border-r border-gray-200 min-w-[130px] transition-all relative ${currentNoteId === note.id ? "bg-white text-indigo-600 border-t-2 border-t-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"
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
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all"
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
          <div className="flex-1 relative h-full">
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
                  {currentNoteId === note.id && (
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

          {/* CHAT INTERFACE */}
          {showChat && (
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl flex flex-col ring-1 ring-gray-900/5">
              <div className="p-3 text-[9px] font-black text-indigo-600/80 border-b border-gray-100 uppercase tracking-[0.2em] px-5">AI Contextual Engine</div>
              <div className="h-32 p-5 text-sm overflow-y-auto space-y-4">
                <div className="bg-indigo-50 text-indigo-900 p-3 rounded-2xl rounded-tl-none max-w-[80%] border border-indigo-100">
                  Reviewing <strong>{docs.find(d => d.id === activeDocId)?.filename || 'document'}</strong>. Ask me anything about the content or context.
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex gap-3 items-center">
                <input className="bg-transparent flex-1 text-sm outline-none placeholder:text-gray-400 text-gray-900" placeholder="Type a command or question..." />
                <button className="bg-indigo-600 text-white font-bold rounded-xl px-4 py-1.5 text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                  Send
                </button>
              </div>
            </div>
          )}
        </section>

        {/* CONTEXT MENU */}
        {contextMenu && (
          <div
            className="fixed bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50 min-w-[120px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDeleteClick}
              className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={12} />
              Delete Note
            </button>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl transform transition-all scale-100 opacity-100">
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
                  className="w-full py-2 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
