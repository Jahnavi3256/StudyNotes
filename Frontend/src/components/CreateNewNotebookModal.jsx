import { Notebook } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default   function CreateNewNotebookModal(props) {

    const [selectedColor, setSelectedColor] = useState("#FF5733");
    const [creating,setCreating] = useState(false);
    const [notebookName, setNotebookName] = useState("");
    const [error,setError] = useState("");

    async function createNewNoteBook(name,colour) {
        if (!notebookName.trim()) {
            setError("Enter name of new notebook");
            return;
        }
        setError("");
        setCreating(true);
        console.log(name, colour)
        try {
            const res = await axios.post("http://localhost:4000/new-notebook-with-code", {
                title: name,
                colour: colour
            }, { withCredentials: true });
            console.log(res.data);
                        props.closeModal();
        } catch (err) { console.error(err); setError(err.message) } 
        finally { setCreating(false); }
    }
  
    return (
        <div>
            {props.isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={()=> props.closeModal()}
        />

        <div className="relative bg-[#0F0F0F] border border-white/10 p-8 rounded-[2rem] w-full max-w-[500px] shadow-[0_0_50px_-12px_rgba(255,87,51,0.2)] z-10 animate-in fade-in zoom-in duration-300">
            
            <header className="mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Create New Notebook</h2>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    This folder will be created in your <span className="text-slate-300 font-medium">Google Drive</span>.
                </p>
            </header>

            <div className="space-y-5">
                <div>
                    {error && (
                        <div className="text-red-700 text-9">{error}</div>
                    )}
                </div>
                {/* Name Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">
                        Notebook Name
                    </label>
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="e.g. Research Vol. 1" 
                        className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5733]/50 focus:bg-[#FF5733]/5 transition-all"
                        onChange={(e) => setNotebookName(e.target.value)}
                    /> 
                </div>

                {/* Color Picker with Highlights */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.1em] font-black text-slate-500 ml-1">
                        Theme Color
                    </label>
                    <div className="flex gap-4 p-1">
                        {['#FF5733', '#3386FF', '#10B981', '#A855F7', '#FACC15'].map(color => (
                            <button 
                                key={color} 
                                onClick={() => setSelectedColor(color)}
                                className={`
                                    w-6 h-6 rounded-full transition-all duration-200 relative
                                    ${selectedColor === color 
                                        ? 'ring-2 ring-white ring-offset-4 ring-offset-[#0F0F0F] scale-110' 
                                        : 'hover:scale-110 border border-white/10'
                                    }
                                `} 
                                style={{ backgroundColor: color }}
                            >
                                {/* Optional: Small checkmark for the selected color */}
                                {selectedColor === color && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-10">
                <button 
                    onClick={() => props.closeModal()}
                    className="flex-1 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-all"
                >
                    Cancel
                </button>
                <button 
                type="submit"
                disabled={creating}
                    onClick={() => {
                        createNewNoteBook(notebookName,selectedColor);  
                    }}
                    className="flex-2 bg-[#FF5733] hover:bg-[#ff6a4d] text-white px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-[#FF5733]/20 transition-all active:scale-95"
                >
                    Create Notebook
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    )
} 