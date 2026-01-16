import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";
export default function Notes () {
    return (
        <>
        <div className="bg-[#212121] h-screen flex flex-row  overflow-hidden ">
        <SideNavbar/>
        <div id="right-part" className="bg-[#212121] w-full h-full">
        <Header/>
        </div>
        </div>
        </>
    );
}