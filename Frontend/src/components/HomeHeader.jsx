import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight } from "lucide-react";
export default function HomeHeader(props) {
    return (
        <div className="flex shrink-0 items-center justify-between mb-8">
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Study Sync</h1>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={props.openModal}
                    className="flex items-center gap-2 !bg-indigo-600 hover:!bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 text-xs font-bold uppercase tracking-wide"
                >
                    <Plus size={16} className={props.creating ? "animate-spin" : ""} />
                    New Notebook
                </button>
                <button
                    onClick={props.openJoinModal}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-indigo-500 text-gray-600 hover:text-indigo-600 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-xs font-bold uppercase tracking-wide"
                >
                    Join Notebook
                </button>
            </div>
        </div>
    )
} 