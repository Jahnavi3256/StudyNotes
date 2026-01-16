import { GrCluster } from "react-icons/gr";
import { GrLink } from "react-icons/gr";
import { CgFileDocument } from "react-icons/cg";
import { FaRegNoteSticky } from "react-icons/fa6";

export const sidebardata = [
    {
        title:"Add Cluster",
        icon:GrCluster,
        link:"/clusters"
    },{
        title:"Add Link",
        icon:GrLink,
        link:"/links"
    },{
        title:"Add Docs",
        icon:CgFileDocument,
        link:"/docs"
    },{
        title:"Add Notes",
        icon:FaRegNoteSticky,
        link:"/notes"
    }
]