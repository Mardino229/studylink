import {useNavigate} from "react-router-dom";
import logo from "../assets/study-removebg-preview.png";

export default function AuthHeader() {

    const navigate = useNavigate();

    return (
        <header className="bg-white">
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={()=> navigate('/')}>
                        <img src={logo} alt="BlueCurve" className="h-8 w-auto" />
                        <h1 className="text-xl font-bold text-gray-800">BlueCurve</h1>
                    </div>
                </div>
            </nav>
        </header>
    )
}