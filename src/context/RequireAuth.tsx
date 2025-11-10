
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {useUser} from "../components/layout/userContext.tsx";



const RequireAuth = () => {

    const {user} = useUser();

    const location = useLocation();



    console.log(user)
    return (
        user?.is_active?
            <Outlet /> :
            <Navigate to="/login" state={{ from: location }} replace />
    )
}

export default RequireAuth;