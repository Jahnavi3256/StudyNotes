import SideNavbar from "../components/SideNavbar"
import Header from "../components/Header"

export default function Link() {
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