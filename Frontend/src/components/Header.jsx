import { CiSearch } from "react-icons/ci";
import { GrCluster } from "react-icons/gr";
import { GrLink } from "react-icons/gr";
import { CgFileDocument } from "react-icons/cg";
import { FaRegNoteSticky } from "react-icons/fa6";
import { useLocation } from 'react-router-dom';
export default function Header() {
    const location = useLocation();
    const path = location.pathname;
    return (


        <>
            <div
                id="header"
                className="w-full h-[50px] border-b border-gray-200 flex justify-evenly items-center"
            >
                {path === "/" && (
                    <div className="w-[35%] flex justify-between items-center rounded-lg border px-4 my-4 gap-2 border-gray-300 text-gray-700">
                        <CiSearch className="pr-0" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 focus:border-gray-400"
                        />
                    </div>
                )}

                {path === "/docs" && (
                    <div className="flex items-center justify-evenly w-full ">
                        <span className="text-gray-700 w-[50%] px-10 flex items-center gap-2.5" > <CgFileDocument />Docs</span>

                        <div className="w-[35%] flex mx-12 justify-end items-center rounded-lg border px-4 my-4 gap-2 border-gray-300 text-gray-700">
                            <CiSearch className="pr-0" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 focus:border-gray-400"
                            />
                        </div>
                    </div>
                )}

                {path === "/links" && (
                    <div className="flex items-center justify-evenly w-full ">
                        <span className="text-gray-700 w-[50%] px-10 flex items-center gap-2.5" > <GrLink /> Links</span>

                        <div className="w-[35%] flex mx-12 justify-end items-center rounded-lg border px-4 my-4 gap-2 border-gray-300 text-gray-700">
                            <CiSearch className="pr-0" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 focus:border-gray-400"
                            />
                        </div>
                    </div>
                )}

                {path === "/clusters" && (
                    <div className="flex items-center justify-evenly w-full ">
                        <span className="text-gray-700 w-[50%] px-10 flex items-center gap-2.5" ><GrCluster />Clusters</span>

                        <div className="w-[35%] flex mx-12 justify-end items-center rounded-lg border px-4 my-4 gap-2 border-gray-300 text-gray-700">
                            <CiSearch className="pr-0" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 focus:border-gray-400"
                            />
                        </div>
                    </div>
                )}

                {path === "/notes" && (
                    <div className="flex items-center justify-evenly w-full ">
                        <span className="text-gray-700 w-[50%] px-10 flex items-center gap-2.5" ><FaRegNoteSticky />Notes</span>

                        <div className="w-[35%] flex mx-12 justify-end items-center rounded-lg border px-4 my-4 gap-2 border-gray-300 text-gray-700">
                            <CiSearch className="pr-0" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 focus:border-gray-400"
                            />
                        </div>
                    </div>
                )}
            </div>

        </>
    )
}