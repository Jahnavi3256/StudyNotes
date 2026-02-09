import { useState } from "react";
import SmallTiptapEditor from "../components/SmallTiptapEditor";
import SideNavbar from "../components/SideNavbar";
import axios from "axios";
import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight } from "lucide-react";
import CreateNewNotebookModal from "../components/createNewNotebookModal";

export default function Home() {
    const [creating, setCreating] = useState(false);
    const [isModalOpen,setIsModalOpen] = useState(true);
   

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    async function createNewNoteBook() {
        setCreating(true);
        try {
            await axios.post("http://localhost:4000/new-notebook", {
                title: "New Notebook",
                colour: "#FF5733"
            }, { withCredentials: true });
        } catch (err) { console.error(err); } 
        finally { setCreating(false); }
    }

    return (

        

        <div className="flex h-screen w-screen bg-[#080808] text-slate-300 overflow-hidden font-sans">

        <CreateNewNotebookModal
        openModal={openModal}
        closeModal={closeModal}
        isModalOpen={isModalOpen}
        />

            {/* 1. FIXED SIDEBAR */}
            <SideNavbar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#141414bb] relative">
                
                {/* 2. MAIN VIEWPORT: p-8 for breathing room, h-full to lock height */}
                <div className="flex-1 p-8 flex flex-row gap-8 w-full h-full overflow-hidden">
                    
                    {/* LEFT SECTION: Notebooks & Dashboard */}
                    <div className="flex-1 flex flex-col min-w-0 h-full" id="left">
                        
                        {/* Welcome Header */}
                        <div className="flex shrink-0 items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Studio Dashboard</h1>
                                <p className="text-sm text-slate-500 mt-1">Friday, Oct 24 • 12 active projects</p>
                            </div>
                            <button 
                                onClick={openModal}
                                className="flex items-center gap-2 bg-[#FF5733] hover:bg-[#ff6a4d] text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-[#FF5733]/20 active:scale-95 text-sm font-bold"
                            >
                                <Plus size={18} className={creating ? "animate-spin" : ""} />
                                New Notebook
                            </button>
                        </div>

                        {/* Recent Notebooks Section */}
                        <section className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">Recent Notebooks</h2>
                                <a className="text-[12px] text-[#FF5733] hover:underline font-medium" href="#">view all</a>
                            </div>
                            
                            {/* Scrollable Grid: grid-cols-3 handles the layout inside the left ID */}
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start pb-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                    <div key={i} className="group bg-[#111111] border border-white/[0.05] p-4 rounded-3xl hover:border-[#FF5733]/40 hover:bg-[#151515] transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-10 h-10 bg-[#FF5733]/10 rounded-xl flex items-center justify-center">
                                                <Book size={20} className="text-[#FF5733]" />
                                            </div>
                                            <ArrowUpRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-base font-semibold text-white truncate">Research Vol. {i}</h3>
                                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">Edited 2h ago</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT SECTION: Fixed Width Sidebar for Editor & Activity */}
                    <aside className="w-[380px] lg:w-[420px] flex flex-col gap-6 h-full shrink-0" id="right">
                        
                        {/* Editor Card (Scratchpad) */}
                        <div className="flex-[2] bg-[#111] border border-white/[0.05]  overflow-hidden flex flex-col shadow-2xl">
                            
                            <div className="flex-1 overflow-hidden p-2">
                                <SmallTiptapEditor />
                            </div>
                        </div>

                        {/* Activity Card */}
                        <div className="flex-1 bg-[#111] border border-white/[0.05] rounded-[2rem] p-6 overflow-hidden flex flex-col shadow-2xl">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6">Live Activity</h3>
                            <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-6 rounded-full bg-slate-800 group-hover:bg-[#FF5733] transition-colors" />
                                            <div>
                                                <p className="text-[12px] text-slate-300">Updated <span className="text-white font-semibold">Project Meta</span></p>
                                                <p className="text-[10px] text-slate-600 mt-0.5 font-medium italic">14:02 PM</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-800 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}