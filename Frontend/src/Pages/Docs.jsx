import Header from "../components/Header";
import SideNavbar from "../components/SideNavbar";

export default function Docs() {
    return (
        <>
            <div className="bg-gray-50 h-screen flex flex-row  overflow-hidden ">
                <SideNavbar />
                <div id="right-part" className="bg-white w-full h-full">
                    <Header />


                </div>
            </div>
        </>

    )
}