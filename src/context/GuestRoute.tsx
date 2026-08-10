import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../components/layout/userContext.tsx";
import { axiosPrivate } from "../utils/api.ts";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import type { User } from "../utils/type.ts";

const GuestRoute = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        if (user?.email) {
            redirectAuthenticated(user, navigate);
            return;
        }

        axiosPrivate.get('user/me')
            .then(res => {
                if (!isMounted) return;
                const userData: User = res.data.data.user;
                setUser(userData);
                redirectAuthenticated(userData, navigate);
            })
            .catch(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading && !user?.email) {
        return (
            <div className="w-screen h-screen text-gray-800 dark:text-white/90 flex justify-center items-center">
                <Loader className="h-64" />
            </div>
        );
    }

    if (user?.email) return null;

    return <Outlet />;
};

function redirectAuthenticated(user: User, navigate: ReturnType<typeof useNavigate>) {
    const dest = user.role?.name === 'admin' ? '/admin/home' : '/home';
    navigate(dest, { replace: true });
}

export default GuestRoute;
