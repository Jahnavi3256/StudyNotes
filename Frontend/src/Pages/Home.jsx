
import { useState } from "react";

import Editor from "./editor";
import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";

export default function Home() {
    
    
    return(
        <>
        <div id="main-page" className="flex flex-row h-screen bg-[#212121] overflow-hidden S">
            
           <SideNavbar/>
            {/* -------------------------------------------- */}

            <div id="right-content-part" className="bg-[#212121] h-full w-full">
                <Header/>

                {/* ------------------------Main-content-part--------------------*/}
                <div id="right-upper-part" className="h-[50vh] w-full flex overflow-hidden">

                <div id="upper-left-part-newpart" className="w-[50%] text-[#e8e8e8]">
                    Imports are going to come here
                </div>

                <div id="upper-right-part-quickNotes" className="w-[50%] p-0 flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden">
                <Editor />
                </div>
                </div>
                </div>
                {/* ---------------------------Recent-content-part------------------ */}

                <div id="recent-horizontal-scroll">

                </div>

            </div>
        
        </div> 
        </>
    )
}