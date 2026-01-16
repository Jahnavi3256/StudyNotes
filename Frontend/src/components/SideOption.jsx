import { useLocation } from "react-router-dom"


export default function SideOptions(props) {
     const location = useLocation();
    return(
       
        <>
        {props.isSidebarOpen ? (
            <div id="option"
            onClick={props.onClick} 
            className={`flex p-2 mx-1 rounded-md  text-[#e8e8e8] cursor-pointer ${props.isActive? "bg-[#333]": "hover:bg-[#303030]" }`}>
            <span id="logo"
            className="flex-[15%] grid place-items-center text-[#e8e8e8] text-sm md:text-md">
                {props.logo &&<props.logo/>}
            </span>
 
            <div id="label" className="flex-[70%]  grid place-content-start align-middle text-sm md:text-md ">{props.title}</div>
            
        </div>): (
            
            <div id="option" 
            onClick={props.onClick}
            className={`flex p-2 mx-1 my-4 rounded-md  text-[#e8e8e8] cursor-pointer ${props.isActive? "bg-[#333]": "hover:bg-[#303030]"}`}>
            <span id="logo"
            className="flex-[15%] grid place-items-center text-[#e8e8e8] text-sm md:text-md">
                {props.logo &&<props.logo/>}
            </span>
 
        
        </div>
    )}

    </>
);
}

