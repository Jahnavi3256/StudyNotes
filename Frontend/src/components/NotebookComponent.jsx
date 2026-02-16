import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight, Clipboard } from "lucide-react";
import { useState ,useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// call the api to get all notebooks store in an array  and render them one by one 
export default function NotebookComponent() {

    const [notebooks,setNotebooks] = useState([]);
    const [loading,setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
          try {
            const res = await axios.get("http://localhost:4000/recent-notebooks",{
                withCredentials: true
            });
            console.log(res.data.notebooks);
            setNotebooks(res.data.notebooks);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        }
    
        fetchData();
    }, []);

    const handleCopyCode = async (e, code, notebookId) => {
        e.stopPropagation();
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            setCopiedId(notebookId);
            setTimeout(() => {
                setCopiedId(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy code", err);
        }
    };

    const formatTimeAgo = (isoDate) => {
        if (!isoDate) return "";
        const updated = new Date(isoDate);
        const now = new Date();
        const diffMs = now - updated;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);
        const diffWeek = Math.floor(diffDay / 7);

        if (diffSec < 60) return "just now";
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
        if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;

        const diffMonth = Math.floor(diffDay / 30);
        if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;

        const diffYear = Math.floor(diffDay / 365);
        return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
    };
    return (
        
        <section className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">Recent Notebooks</h2>
                <a className="text-[12px] text-[#FF5733] hover:underline font-medium" href="#">view all</a>
                {/* on click of view all redirect to some other page where it listes all Notebooks  */}
            </div>
                            
        {/* Scrollable Grid: grid-cols-3 handles the layout inside the left ID */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start pb-2">
                {notebooks.map((note) => (
                    <div key={note.id} 
                        className="group bg-[#111111] border border-white/[0.05] p-4 rounded-3xl hover:border-[#FF5733]/40 hover:bg-[#151515] transition-all cursor-pointer"
                        onClick={() =>
                            navigate(`/notebook/${note.id}`, {
                                state: { notebook: note }
                            })
                        }
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-10 h-10 bg-[#FF5733]/10 rounded-xl flex items-center justify-center">
                                <Book size={20} className="text-[#FF5733]" />
                            </div>
                            <div className="flex items-center gap-2">
                                {note.isOwner && note.code && (
                                    <button
                                        onClick={(e) => handleCopyCode(e, note.code, note.id)}
                                        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        {copiedId === note.id ? (
                                            <span>Copied</span>
                                        ) : (
                                            <Clipboard size={12} />
                                        )}
                                    </button>
                                )}
                                <ArrowUpRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-white truncate"> {note.title}</h3>
                        {/* <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                            Edited {formatTimeAgo(note.updated_at)}
                        </p> */}
                    </div>
                ))}
            </div>
        </section>  
        
    )
}