import { useState } from "react";
import axios from "axios";

export default function JoinNotebookModal({ isOpen, onClose, onNotebookJoined }) {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleJoin() {
    if (!code.trim()) {
      setError("Please enter a notebook code.");
      return;
    }

    setError("");
    setJoining(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/join-notebook",
        { code },
        { withCredentials: true }
      );
      // Immediately append to the notebooks list without a page refresh
      if (onNotebookJoined && res.data.notebook) {
        onNotebookJoined(res.data.notebook);
      }
      setCode("");
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Failed to join notebook";
      setError(message);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white border border-gray-200 p-8 rounded-2xl w-full max-w-[420px] shadow-2xl z-10">
        <header className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Join Notebook
          </h2>
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
            Enter the shared notebook code to join and get access.
          </p>
        </header>

        <div className="space-y-5">
          {error && (
            <div className="text-red-500 text-xs mb-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Notebook Code
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. ABCD2345"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-gray-400"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-all hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={joining}
            onClick={handleJoin}
            className="flex-2 !bg-indigo-600 hover:!bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            {joining ? "Joining..." : "Join Notebook"}
          </button>
        </div>
      </div>
    </div>
  );
}

