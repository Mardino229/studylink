import {useNavigate} from "react-router-dom";
import logo from "../../assets/mylogo.png";
export default function AuthHeader() {

    const navigate = useNavigate();

    return (
        <header className="bg-white dark:bg-transparent">
            <nav className="container mx-auto px-6 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={()=> navigate('/')}>
                        <img src={logo} alt="BlueCurve" className="h-12 w-auto" />
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">BlueCurve</h1>
                    </div>
                </div>
            </nav>
        </header>
    )
}