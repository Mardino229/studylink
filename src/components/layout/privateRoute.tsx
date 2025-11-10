// import { useEffect } from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {useUserContext} from "./userContext.tsx";
import {useMe} from "../../utils/auth.ts";

export default function PrivateRoute() {
    const { user } = useUserContext();
    const me = useMe();
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (!user?.email) {
    //         me.mutate();
    //     }
    // }, []);

    if (!user?.email) {
        return me.isPending? <p>Chargement....</p> : me.isError? navigate("/login") : <Outlet /> ;
    }

    if (!user.is_active) {
        return navigate("/confirm?email=" + user.email);
    }

    if (user.study_level===null) {
        return
    }

    return <Outlet />;
}
