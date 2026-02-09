import { useEffect, useState, useCallback, useRef } from "react";
import Editor from "./editor";
import TiptapEdited from "../components/TiptapEditor";

export default function Viewer() {
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDocId, setActiveDocId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentNote,setCurrentNote] = useState(1);
  const [isEditing,setIsEditing] = useState(true);

  
  // Resizing State: Initial width of PDF section (in percentage)
  const [pdfWidth, setPdfWidth] = useState(40); 
  const isResizing = useRef(false);

  const [documents, setDocuments] = useState([
    { id: 1, name: "Project_Proposal.pdf", color: "bg-blue-500/10" },
    { id: 2, name: "Research_Notes.pdf", color: "bg-purple-500/10" },
    { id: 3, name: "Financial_Report.pdf", color: "bg-amber-500/10" },
    { id: 4, name: "Data_Analysis.pdf", color: "bg-emerald-500/10" },
  ]);

  // --- Resizing Logic ---
  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    const sidebarWidth = isSidebarOpen ? 112 : 0; // 112px is w-28
    const availableWidth = window.innerWidth - sidebarWidth;
    const newLeftWidth = e.clientX - sidebarWidth;
    const newPercentage = (newLeftWidth / availableWidth) * 100;

    if (newPercentage > 20 && newPercentage < 70) {
      setPdfWidth(newPercentage);
    }
  }, [isSidebarOpen]);

  return (
    <div className="w-full h-screen bg-[#0a0a0a] text-gray-200 flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="h-8 flex items-center justify-between px-6 border-b border-white/5 bg-[#111111] shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="flex items-center gap-2 text-sm border-l border-white/10 pl-4">
            <span className="text-gray-500">Notebook</span>
            <span className="text-gray-600">/</span>
            <span className="font-semibold text-gray-200">{documents.find(d => d.id === activeDocId)?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowChat(!showChat)} 
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${showChat ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            {/* here rather than the text of show and hide text keep two icons of show and hide differently  */} 
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>
        </div>
      </header>

      {/* MAIN VIEW */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 1. COLLAPSIBLE SIDEBAR */}
        <aside 
          className={`bg-[#0d0d0d] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
            isSidebarOpen ? "w-28 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="group flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => setActiveDocId(doc.id)}>
                <div className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    activeDocId === doc.id ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : "border-white/5 group-hover:border-white/20"
                  } ${doc.color}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                </div>
                <span className={`text-[10px] truncate w-full text-center px-1 transition-colors ${
                  activeDocId === doc.id ? "text-emerald-400 font-bold" : "text-gray-500 group-hover:text-gray-300"
                }`}>
                  {doc.name.split('.')[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 h-24 border-t border-white/5">
             <button className=" w-full h-[87%] rounded-lg border border-dashed border-white/10 flex items-center justify-center hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all text-gray-600 hover:text-emerald-500 gap-0">
                <span className="text-xl pl-1">+</span>
                <span className="text-[11px]">Add Document</span>
             </button>
          </div>
        </aside>

        {/* 2. PDF VIEWER (RESIZABLE) */}
        <section 
          style={{ width: `${pdfWidth}%` }}
          className="bg-[#141414] flex flex-col items-center p-1 overflow-y-auto"
        >
           <div className="w-full max-w-3xl aspect-[1/1.41] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center text-black/20 font-serif p-12 text-center select-none">
              <div className="border-2 border-black/5 w-full h-full flex items-center justify-center border-dashed">
                [ {documents.find(d => d.id === activeDocId)?.name} ]
              </div>
           </div>
        </section>

        {/* RESIZER HANDLE */}
        <div 
          onMouseDown={startResizing}
          className="w-1 hover:w-1.5 transition-all bg-transparent hover:bg-emerald-500 cursor-col-resize active:bg-emerald-500 z-10 flex-shrink-0 relative group"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/5 group-hover:bg-transparent" />
        </div>

        {/* 3. EDITOR (FLEX-1) */}
        <section className="flex-1 bg-[#0f0f0f] relative min-w-0">
          <div className="h-full overflow-y-auto">
            <TiptapEdited
          note={currentNote} 
          editing={isEditing} 
          setEditing={setIsEditing}
          allNotes={() => console.log("Refreshing notes list...")}
        />
          </div>
          
          {/* CHAT INTERFACE */}
          {showChat && (
            <div className="absolute bottom-6 left-6 right-6 bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col ring-1 ring-white/5">
               <div className="p-3 text-[9px] font-black text-emerald-500/80 border-b border-white/5 uppercase tracking-[0.2em] px-5">AI Contextual Engine</div>
               <div className="h-32 p-5 text-sm overflow-y-auto space-y-4">
                  <div className="bg-emerald-500/10 text-emerald-200 p-3 rounded-2xl rounded-tl-none max-w-[80%] border border-emerald-500/20">
                    Reviewing <strong>{documents.find(d => d.id === activeDocId)?.name}</strong>. Ask me anything about the content or context.
                  </div>
               </div>
               <div className="p-4 bg-white/5 flex gap-3 items-center">
                  <input className="bg-transparent flex-1 text-sm outline-none placeholder:text-gray-600" placeholder="Type a command or question..." />
                  <button className="bg-emerald-500 text-black font-bold rounded-xl px-4 py-1.5 text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                    Send
                  </button>
               </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}