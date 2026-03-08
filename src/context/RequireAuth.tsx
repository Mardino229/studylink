
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../components/layout/userContext.tsx";
import { axiosPrivate } from "../utils/api.ts";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";



const RequireAuth = () => {

    const { user, setUser } = useUser();
    const [isLoading, setIsLoading] = useState(true);

    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                const response = await axiosPrivate.get('user/me')
                const userData = response.data.data.user;
                console.log(userData)
                if (isMounted) {
                    setUser(userData)
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        if (!user?.email) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        }
    }, []);

    console.log(user)

    if (isLoading) {
        return (
            <div className="w-screen h-screen text-gray-800 dark:text-white/90 flex justify-center items-center">
                <Loader className="h-64" />
            </div>
        );
    }

    if (!user?.email && !isLoading) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    console.log(user)

    return <Outlet />;
}

export default RequireAuth;