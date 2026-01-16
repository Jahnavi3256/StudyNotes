import { useEffect, useState } from "react";
import Editor from "./editor";

export default function Viewer() {
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen change (ESC key support)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-gray-200 flex flex-col">

      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-gray-800 bg-[#151515]">
        <div className="flex items-center gap-2 text-sm">
          <span>📄</span>
          <span className="font-medium">Document.pdf</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <button
            onClick={() => setShowChat(!showChat)}
            className="hover:text-white transition"
          >
            💬 Chat
          </button>

          <button
            onClick={toggleFullscreen}
            className="hover:text-white transition"
          >
            {isFullscreen ? "🡼 Exit Fullscreen" : "⛶ Fullscreen"}
          </button>

          <span className="text-xs">ESC</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Document */}
        <section className="w-[50%] h-full bg-[#1a1a1a] border-r border-gray-800">
          {/* PDF / Doc Viewer */}
        </section>

        {/* RIGHT: Notes */}
        <section className="relative w-[50%] h-full bg-[#181818]">
          <Editor />

          {/* Floating Chat */}
          {showChat && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#1f1f1f] border border-gray-700 rounded-2xl shadow-2xl">

              {/* Messages */}
              <div className="max-h-48 overflow-y-auto p-4 space-y-3 text-sm">
                <div className="text-gray-300">
                  Ask questions about this document…
                </div>

                <div className="bg-emerald-600 text-black rounded-xl px-3 py-2 w-fit ml-auto">
                  Summarize page 2
                </div>

                <div className="bg-[#2a2a2a] rounded-xl px-3 py-2 w-fit">
                  Page 2 discusses the core concept of…
                </div>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-700">
                <button className="text-gray-400 hover:text-white text-lg">
                  +
                </button>

                <input
                  type="text"
                  placeholder="Ask PDF…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
                />

                <button className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition">
                  ↑
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
