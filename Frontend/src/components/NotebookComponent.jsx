import { Plus, Clock, Book, Activity, ArrowUpRight, ChevronRight } from "lucide-react";
import { useState ,useEffect} from "react";
import axios from "axios";
// call the api to get all notebooks store in an array  and render them one by one 
export default function NotebookComponent() {

    const [notebooks,setNotebooks] = useState([]);
    const [loading,setLoading] = useState(false);
    useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("http://localhost:4000/recent-notebooks",{
            withCredentials: true
        });
        console.log(res.data.notebooks);
        setNotebooks(res.data.notebooks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
    return (
        
        <section className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">Recent Notebooks</h2>
                <a className="text-[12px] text-[#FF5733] hover:underline font-medium" href="#">view all</a>
                {/* on click of view all redirect to some other page where it listes all Notebooks  */}
            </div>
                            
        {/* Scrollable Grid: grid-cols-3 handles the layout inside the left ID */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start pb-2">
                {notebooks.map((note) => (
                    <div key={note.id} className="group bg-[#111111] border border-white/[0.05] p-4 rounded-3xl hover:border-[#FF5733]/40 hover:bg-[#151515] transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-10 h-10 bg-[#FF5733]/10 rounded-xl flex items-center justify-center">
                                <Book size={20} className="text-[#FF5733]" />
                            </div>
                            <ArrowUpRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                    <h3 className="text-base font-semibold text-white truncate"> {note.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">Edited 2h ago</p>
                    </div>
                ))}
            </div>
        </section>  
        
    )
}