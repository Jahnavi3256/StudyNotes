import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight } from "lucide-react";
export default function HomeHeader(props){
    return (
        <div className="flex shrink-0 items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Studio Dashboard</h1>
                                <p className="text-sm text-slate-500 mt-1">Friday, Oct 24 • 12 active projects</p>
                            </div>
                            <button 
                                onClick={props.openModal}
                                className="flex items-center gap-2 bg-[#FF5733] hover:bg-[#ff6a4d] text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-[#FF5733]/20 active:scale-95 text-sm font-bold"
                            >
                                <Plus size={18} className={props.creating ? "animate-spin" : ""} />
                                New Notebook
                            </button>
                        </div>
    )
} 