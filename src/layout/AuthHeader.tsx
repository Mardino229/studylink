import {useNavigate} from "react-router-dom";

export default function AuthHeader() {

    const navigate = useNavigate();

    return (
        <header className="bg-white">
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={()=> navigate('/')}>
                        <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 48 48"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                        </svg>
                        <h1 className="text-xl font-bold text-gray-800">StudyLink</h1>
                    </div>
                </div>
            </nav>
        </header>
    )
}