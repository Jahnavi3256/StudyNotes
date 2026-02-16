import { useState } from "react";
import SmallTiptapEditor from "../components/SmallTiptapEditor";
import SideNavbar from "../components/SideNavbar";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import NotebookComponent from "../components/NotebookComponent";
import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight } from "lucide-react";
import CreateNewNotebookModal from "../components/createNewNotebookModal";
import JoinNotebookModal from "../components/JoinNotebookModal";

export default function Home() {
    const [creating, setCreating] = useState(false);
    const [isModalOpen,setIsModalOpen] = useState(true);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openJoinModal = () => setIsJoinModalOpen(true);
    const closeJoinModal = () => setIsJoinModalOpen(false);


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

            {/* Create NewNotebook Modal */}
            <CreateNewNotebookModal
              openModal={openModal}
              closeModal={closeModal}
              isModalOpen={isModalOpen}
            />

            {/* Join Notebook Modal */}
            <JoinNotebookModal
              isOpen={isJoinModalOpen}
              onClose={closeJoinModal}
            />

            {/* 1. FIXED SIDEBAR */}
            <SideNavbar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#141414bb] relative">
                
                {/* 2. MAIN VIEWPORT: p-8 for breathing room, h-full to lock height */}
                <div className="flex-1 p-8 flex flex-row gap-8 w-full h-full overflow-hidden">
                    
                    {/* LEFT SECTION: Notebooks & Dashboard */}
                    <div className="flex-1 flex flex-col min-w-0 h-full" id="left">
                        
                        {/* Welcome Header */}
                        <HomeHeader
                          openModal={openModal}
                          creating={creating}
                          isModalOpen={isModalOpen}
                          openJoinModal={openJoinModal}
                        />

                        {/* Recent Notebooks Section */}
                        <NotebookComponent/>
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