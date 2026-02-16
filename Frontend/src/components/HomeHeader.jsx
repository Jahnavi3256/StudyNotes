import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight } from "lucide-react";
export default function HomeHeader(props){
    return (
        <div className="flex shrink-0 items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Studio Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={props.openModal}
                    className="flex items-center gap-2 bg-[#FF5733] hover:bg-[#ff6a4d] text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-[#FF5733]/20 active:scale-95 text-sm font-bold"
                >
                    <Plus size={18} className={props.creating ? "animate-spin" : ""} />
                    New Notebook
                </button>
                <button
                    onClick={props.openJoinModal}
                    className="flex items-center gap-2 bg-transparent border border-white/15 hover:border-blue-500/60 text-slate-200 hover:text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-black/40 active:scale-95 text-sm font-semibold"
                >
                    Join Notebook
                </button>
            </div>
        </div>
    )
} 