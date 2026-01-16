import { RiMenu3Line } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import RecentOption from "../components/RecentOption"
import { recentdata } from "../Data/recentdata"
import { sidebardata } from "../Data/sidebardata"
import SideOption from "../components/SideOption"
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";



export default function SideNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen,setIsSidebarOpen] = useState(false);
    const [isMobileSidebarOpen,setIsMobileSidebarOpen] = useState(false);
    const handleHamburgerClick = () => {
        setIsSidebarOpen(true);
    }
    const handleCross = () => {
        setIsSidebarOpen(false);
    }


    return (<>
    <div id="side Nav bar big " className={`
                bg-[#171717] h-full w-[280px]
                hidden md:flex md:flex-col
                transition-all duration-300
                ${isSidebarOpen ? "md:w-[280px]" : "md:w-0"}
                `}>
                <div id="side-upper-part" className="w-full bg-[#212121] h-[50px] flex justify-end items-center pr-3">
                    <IoMdClose className="text-[#e8e8e8] cursor-pointer" size={22} onClick={handleCross}/>
                </div>
                <div id="side-lower-part">
                    {
                        sidebardata.map((Data) => {
                        const isActive = location.pathname === Data.link;
                        return(<SideOption
                        key={Data.link}
                        onClick={()=>{navigate(Data.link)}}
                        title={Data.title}
                        logo={Data.icon}
                        isSidebarOpen={isSidebarOpen}
                        isActive={isActive}
                        />)
                    })
                    }
                </div>
                <div id="Recent-Heading" className=" text-[#CCCC] my-4 pl-2 md:text-md lg:text-lg">Recent</div>
                <div id="side-recent-part" className="overflow-y-auto  flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-sidebar">
                    {
                        recentdata.map((Data) => {
                            
                            return(<RecentOption
                           
                            title={Data.title}
                            tag={Data.tag}
                            
                            />)
                        })
                    }
                </div>
                <div id="user-detials" className="h-20 w-full flex text:md md:text:lg text-[#e8e8e8] ">
                    <div  id="user-logo" className="flex-[25%] grid place-items-center  ">ULO</div>
                    <div id="user-name" className="flex-[75%] grid place-items-center">user name</div>
                </div>
            </div>

            <button className="md:hidden border border-[#424242] h-[50px] bg-[#212121] px-6 text-[#e8e8e8]" onClick={() => setIsMobileSidebarOpen(true)}>
            <RiMenu3Line />
            </button>
            
            <div
            className={`
            bg-[#171717] h-full w-[260px]
            fixed top-0 left-0 z-50
            transition-transform duration-300
            ${isMobileSidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}
            md:hidden
            `}
            >
             <div id="side-upper-part" className="w-full bg-[#212121] h-[50px] flex justify-end items-center pr-3">
                    <IoMdClose className="text-[#e8e8e8] cursor-pointer" size={22} onClick={() => setIsMobileSidebarOpen(false)}/>
                </div>
                <div id="side-lower-part">
                    {
                        sidebardata.map((Data) => {
                        const isActive = location.pathname === Data.link;
                        return(<SideOption
                        key={Data.link}
                        title={Data.title}
                        logo={Data.icon}
                        isSidebarOpen={isMobileSidebarOpen}
                        onClick={()=> navigate(Data.link)}
                        isActive={isActive}
                        />)
                    })
                    }
                </div>
                <div id="Recent-Heading" className=" text-[#CCCC] my-4 pl-2 md:text-md lg:text-lg">Recent</div>
                <div id="side-recent-part" className="overflow-y-auto  flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-sidebar">
                    {
                        recentdata.map((Data) => {
                            return(<RecentOption
                            title={Data.title}
                            tag={Data.tag}
                            />)
                        })
                    }
                </div>
                <div id="user-detials" className="h-20 w-full flex text:md md:text:lg text-[#e8e8e8] ">
                    <div  id="user-logo" className="flex-[25%] grid place-items-center  ">ULO</div>
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
                    <div id="sidebar small" className={` ${isSidebarOpen? "hidden": "md:flex" } hidden w-14 h-full bg-[#212121] border-r border-[#424242] flex-col`}>
                        <div id="website logo" className="w-14 flex cursor-pointer h-[50px] text-[#e8e8e8] justify-center items-center rounded-lg hover:border hover:border-[#424242]  transition-all duration-1000" onClick={handleHamburgerClick}>
                        <RiMenu3Line className="p-0 m-0"/>
                        
                        </div>
                        <div id="logos-only-part">
                        {
                        sidebardata.map((Data) => {
                        const isActive = location.pathname === Data.link;
                        return(<SideOption
                        onClick={()=> navigate(Data.link)}
                        title={Data.title}
                        logo={Data.icon}
                        isSidebarOpen={isSidebarOpen}
                        isActive={isActive}
                        />)
                        })
                        }
                        </div>
                    </div>
    </>)
}