import { RiMenu3Line } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Book } from "lucide-react";



export default function SideNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchNotebooks() {
            setLoading(true);
            try {
                const res = await axios.get("http://localhost:4000/all-notebooks", {
                    withCredentials: true
                });
                setNotebooks(res.data.notebooks || []);
            } catch (err) {
                console.error("Failed to fetch notebooks:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchNotebooks();
    }, []);

    const handleHamburgerClick = () => {
        setIsSidebarOpen(true);
    }
    const handleCross = () => {
        setIsSidebarOpen(false);
    }

    const handleNotebookClick = (notebook) => {
        navigate(`/notebook/${notebook.id}`, {
            state: { notebook }
        });
    }


    return (<>
        <div id="side Nav bar big " className={`
                bg-white h-full w-[280px]
                hidden md:flex md:flex-col
                transition-all duration-300
                border-r border-gray-200
                ${isSidebarOpen ? "md:w-[280px]" : "md:w-0"}
                `}>
            <div id="side-upper-part" className="w-full bg-gray-50 h-[50px] flex justify-end items-center pr-3 border-b border-gray-200">
                <IoMdClose className="text-gray-500 cursor-pointer hover:text-gray-800" size={22} onClick={handleCross} />
            </div>
            {/* Desktop View Content */}
            <div id="side-notebooks-part" className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-sidebar pt-2">
                {loading ? (
                    <div className="text-gray-400 pl-2 text-sm">Loading...</div>
                ) : (
                    <>
                        {/* Personal Notebooks Section */}
                        <div className="text-gray-500 mb-2 pl-2 md:text-sm lg:text-base font-semibold uppercase tracking-wider">Personal</div>
                        {notebooks.filter(n => n.category === 'Personal').length === 0 ? (
                            <div className="text-gray-400 pl-4 text-xs mb-4 italic">No personal notebooks</div>
                        ) : (
                            notebooks.filter(n => n.category === 'Personal').map((notebook) => {
                                const isActive = location.pathname === `/notebook/${notebook.id}`;
                                return (
                                    <div
                                        key={notebook.id}
                                        onClick={() => handleNotebookClick(notebook)}
                                        className={`text-sm md:text-md text-gray-700 flex rounded-md cursor-pointer hover:bg-gray-100 p-2 mx-1.5 transition-colors ${isActive ? "bg-indigo-50 text-indigo-700" : ""
                                            }`}
                                    >
                                        <span className="flex-[50%] grid place-items-start pl-2 truncate">{notebook.title}</span>
                                        <span className="flex-[1%] grid place-items-center">
                                            <Book size={14} />
                                        </span>
                                    </div>
                                );
                            })
                        )}

                        {/* Shared Notebooks Section */}
                        <div className="text-gray-500 mt-6 mb-2 pl-2 md:text-sm lg:text-base font-semibold uppercase tracking-wider">Shared</div>
                        {notebooks.filter(n => n.category === 'Shared').length === 0 ? (
                            <div className="text-gray-400 pl-4 text-xs mb-4 italic">No shared notebooks</div>
                        ) : (
                            notebooks.filter(n => n.category === 'Shared').map((notebook) => {
                                const isActive = location.pathname === `/notebook/${notebook.id}`;
                                return (
                                    <div
                                        key={notebook.id}
                                        onClick={() => handleNotebookClick(notebook)}
                                        className={`text-sm md:text-md text-gray-700 flex rounded-md cursor-pointer hover:bg-gray-100 p-2 mx-1.5 transition-colors ${isActive ? "bg-amber-50 text-amber-900" : ""
                                            }`}
                                    >
                                        <span className="flex-[50%] grid place-items-start pl-2 truncate">{notebook.title}</span>
                                        <span className="flex-[1%] grid place-items-center">
                                            {/* Using a different icon or styling for shared could be good, but keeping Book for now */}
                                            <Book size={14} />
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </>
                )}
            </div>
            <div id="user-detials" className="h-20 w-full flex text:md md:text:lg text-gray-700 border-t border-gray-200">
                <div id="user-logo" className="flex-[25%] grid place-items-center text-indigo-600 font-bold">ULO</div>
                <div id="user-name" className="flex-[75%] grid place-items-center font-medium">user name</div>
            </div>
        </div>

        <button className="md:hidden border border-gray-200 h-[50px] bg-white px-6 text-gray-700" onClick={() => setIsMobileSidebarOpen(true)}>
            <RiMenu3Line />
        </button>

        <div
            className={`
            bg-white h-full w-[260px]
            fixed top-0 left-0 z-50
            transition-transform duration-300
            ${isMobileSidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}
            md:hidden
            `}
        >
            <div id="side-upper-part" className="w-full bg-gray-50 h-[50px] flex justify-end items-center pr-3 border-b border-gray-200">
                <IoMdClose className="text-gray-500 cursor-pointer" size={22} onClick={() => setIsMobileSidebarOpen(false)} />
            </div>

            <div id="side-notebooks-part" className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-sidebar pt-4">
                {loading ? (
                    <div className="text-gray-400 pl-2 text-sm">Loading...</div>
                ) : (
                    <>
                        {/* Personal Notebooks Section */}
                        <div className="text-gray-500 mb-2 pl-2 text-sm font-semibold uppercase tracking-wider">Personal</div>
                        {notebooks.filter(n => n.category === 'Personal').length === 0 ? (
                            <div className="text-gray-400 pl-4 text-xs mb-4 italic">No personal notebooks</div>
                        ) : (
                            notebooks.filter(n => n.category === 'Personal').map((notebook) => {
                                const isActive = location.pathname === `/notebook/${notebook.id}`;
                                return (
                                    <div
                                        key={notebook.id}
                                        onClick={() => handleNotebookClick(notebook)}
                                        className={`text-sm md:text-md text-gray-700 flex rounded-md cursor-pointer hover:bg-gray-100 p-2 mx-1.5 transition-colors ${isActive ? "bg-indigo-50 text-indigo-700" : ""
                                            }`}
                                    >
                                        <span className="flex-[50%] grid place-items-start pl-2 truncate">{notebook.title}</span>
                                        <span className="flex-[1%] grid place-items-center">
                                            <Book size={14} />
                                        </span>
                                    </div>
                                );
                            })
                        )}

                        {/* Shared Notebooks Section */}
                        <div className="text-gray-500 mt-6 mb-2 pl-2 text-sm font-semibold uppercase tracking-wider">Shared</div>
                        {notebooks.filter(n => n.category === 'Shared').length === 0 ? (
                            <div className="text-gray-400 pl-4 text-xs mb-4 italic">No shared notebooks</div>
                        ) : (
                            notebooks.filter(n => n.category === 'Shared').map((notebook) => {
                                const isActive = location.pathname === `/notebook/${notebook.id}`;
                                return (
                                    <div
                                        key={notebook.id}
                                        onClick={() => handleNotebookClick(notebook)}
                                        className={`text-sm md:text-md text-gray-700 flex rounded-md cursor-pointer hover:bg-gray-100 p-2 mx-1.5 transition-colors ${isActive ? "bg-amber-50 text-amber-900" : ""
                                            }`}
                                    >
                                        <span className="flex-[50%] grid place-items-start pl-2 truncate">{notebook.title}</span>
                                        <span className="flex-[1%] grid place-items-center">
                                            <Book size={14} />
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </>
                )}
            </div>
            <div id="user-detials" className="h-20 w-full flex text:md md:text:lg text-[#e8e8e8] ">
                <div id="user-logo" className="flex-[25%] grid place-items-center  ">ULO</div>
                <div id="user-name" className="flex-[75%] grid place-items-center">user name</div>
            </div>
        </div>
        {isMobileSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/50 md:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
            />
        )}

        {/* -------------------------------------------- */}
        <div id="sidebar small" className={` ${isSidebarOpen ? "hidden" : "md:flex"} hidden w-14 h-full bg-gray-50 border-r border-gray-200 flex-col`}>
            <div id="website logo" className="w-14 flex cursor-pointer h-[50px] text-gray-600 justify-center items-center rounded-lg hover:bg-gray-200  transition-all duration-300" onClick={handleHamburgerClick}>
                <RiMenu3Line className="p-0 m-0" />

            </div>
        </div>
    </>)
}