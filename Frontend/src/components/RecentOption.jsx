import { GrCluster } from "react-icons/gr";
import {  GrLink} from "react-icons/gr";
import { CgFileDocument } from "react-icons/cg";
import { FaRegNoteSticky } from "react-icons/fa6";
export default function RecentOption (props) {
    const renderIcon = (tag) => {
        switch(tag){
            case "cluster":
                return <GrCluster size={14} />;
            case "Link":
                return <GrLink size={14} />;
            case "Docs":
                return <CgFileDocument size={14} />;
            case "Note":
                return <FaRegNoteSticky size={14} />;
            default:
                return null;
        }
    };
    return(
        <>
        <div id="parentOption" className="text-sm md:text:md text-[#e8e8e8] flex rounded-md cursor-pointer hover:bg-[#303030] p-2 mx-1.5 ">
            <span id="title" className="flex-[50%]  grid place-items-start pl-2">{props.title}</span>
            <span id="tag" className="flex-[1%] grid place-items-center border rounded-2xl  border-[#141414]">
                {
                    renderIcon(props.tag)
                }

            </span>
        </div>
        </>
    )
}