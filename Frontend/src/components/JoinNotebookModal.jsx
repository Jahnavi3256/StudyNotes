import { useState } from "react";
import axios from "axios";

export default function JoinNotebookModal({ isOpen, onClose }) {
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
      await axios.post(
        "http://localhost:4000/join-notebook",
        { code },
        { withCredentials: true }
      );
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
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#0F0F0F] border border-white/10 p-8 rounded-[2rem] w-full max-w-[420px] shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] z-10">
        <header className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Join Notebook
          </h2>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
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
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">
              Notebook Code
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. ABCD2345"
              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={joining}
            onClick={handleJoin}
            className="flex-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            {joining ? "Joining..." : "Join Notebook"}
          </button>
        </div>
      </div>
    </div>
  );
}

