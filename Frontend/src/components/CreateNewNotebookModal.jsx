import { Notebook } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function CreateNewNotebookModal(props) {

    const [selectedColor, setSelectedColor] = useState("#FF5733");
    const [creating, setCreating] = useState(false);
    const [notebookName, setNotebookName] = useState("");
    const [error, setError] = useState("");

    async function createNewNoteBook(name, colour) {
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
            // Pass the created notebook back to parent
            if (props.onNotebookCreated && res.data.notebook) {
                props.onNotebookCreated(res.data.notebook);
            }
            props.closeModal();
            setNotebookName(""); // Reset form
        } catch (err) { console.error(err); setError(err.message) }
        finally { setCreating(false); }
    }

    return (
        <div>
            {props.isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => props.closeModal()}
                    />

                    <div className="relative bg-white border border-gray-200 p-8 rounded-2xl w-full max-w-[500px] shadow-2xl z-10 animate-in fade-in zoom-in duration-300">
                        {creating && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 border-4 border-[#FF5733]/20 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-transparent border-t-[#FF5733] rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-gray-600 text-sm font-medium tracking-wide">Creating notebook...</p>
                                </div>
                            </div>
                        )}

                        <header className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Notebook</h2>
                            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                                This folder will be created in your <span className="text-gray-700 font-medium">Google Drive</span>.
                            </p>
                        </header>

                        <div className={`space-y-5 ${creating ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div>
                                {error && (
                                    <div className="text-red-700 text-9">{error}</div>
                                )}
                            </div>
                            {/* Name Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                                    Notebook Name
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Research Vol. 1"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-gray-400"
                                    onChange={(e) => setNotebookName(e.target.value)}
                                />
                            </div>

                            {/* Color Picker with Highlights */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[0.1em] font-black text-gray-400 ml-1">
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
                                                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white scale-110'
                                                    : 'hover:scale-110 border border-gray-200'
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
                                className="flex-1 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-all hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                onClick={() => {
                                    createNewNoteBook(notebookName, selectedColor);
                                }}
                                className="flex-2 !bg-indigo-600 hover:!bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    "Create Notebook"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 