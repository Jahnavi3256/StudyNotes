import { useState, useRef } from "react";
import SideNavbar from "../components/SideNavbar";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import NotebookComponent from "../components/NotebookComponent";
import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight } from "lucide-react";
import CreateNewNotebookModal from "../components/CreateNewNotebookModal";
import JoinNotebookModal from "../components/JoinNotebookModal";

export default function Home() {
    const [creating, setCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const notebookComponentRef = useRef(null);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openJoinModal = () => setIsJoinModalOpen(true);
    const closeJoinModal = () => setIsJoinModalOpen(false);


    async function createNewNoteBook() {
        setCreating(true);
        try {
            await axios.post("http://localhost:4000/new-notebook", {
                title: "New Notebook",
                colour: "#4f46e5"
            }, { withCredentials: true });
        } catch (err) { console.error(err); }
        finally { setCreating(false); }
    }

    return (



        <div className="flex h-screen w-screen bg-gray-50 text-gray-600 overflow-hidden font-sans">

            {/* Create NewNotebook Modal */}
            <CreateNewNotebookModal
                openModal={openModal}
                closeModal={closeModal}
                isModalOpen={isModalOpen}
                onNotebookCreated={(notebook) => {
                    // Add the new notebook to NotebookComponent state
                    if (notebookComponentRef.current) {
                        notebookComponentRef.current.addNotebook(notebook);
                    }
                }}
            />

            {/* Join Notebook Modal */}
            <JoinNotebookModal
                isOpen={isJoinModalOpen}
                onClose={closeJoinModal}
            />

            {/* 1. FIXED SIDEBAR */}
            <SideNavbar />

            <main className="flex-1 flex flex-col min-w-0 bg-white relative">

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
                        <NotebookComponent ref={notebookComponentRef} />
                    </div>

                    {/* RIGHT SECTION: Fixed Width Sidebar for Editor & Activity */}
                    <aside className="w-[380px] lg:w-[420px] flex flex-col gap-6 h-full shrink-0" id="right">

                        {/* Activity Card */}
                        <div className="flex-1 bg-white border border-gray-200 rounded-[2rem] p-6 overflow-hidden flex flex-col shadow-sm h-full">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Live Activity</h3>
                            <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar">
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-default p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-8 rounded-full bg-gray-200 group-hover:bg-indigo-600 transition-colors" />
                                            <div>
                                                <p className="text-[13px] text-gray-600 font-medium">Updated <span className="text-gray-900 font-bold">Project Meta</span></p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">14:02 PM • Just now</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
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