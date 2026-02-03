import {useEffect, useState} from "react";
import {Outlet} from "react-router";
import useRefreshToken from "../hoooks/useRefreshToken.ts";
import {Loader} from "lucide-react";
import {useUser} from "../components/layout/userContext.tsx";
import {useQueryClient} from "@tanstack/react-query";


function PersistLogin () {

    const refresh = useRefreshToken();
    const {user} = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {

        const verifyRefreshToken = async () => {
            try {
                await queryClient.invalidateQueries({ queryKey: ['user'] });
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setIsLoading(false);
            }
        }
        if (!user!.email) {
            verifyRefreshToken().then(

            );
        } else {
            setIsLoading(false);
        }
        // auth.accessToken == "" ? verifyRefreshToken() : setIsLoading(false);
    }, [user?.email, refresh]);

    useEffect(() => {
        console.log(`isLoading: ${isLoading}`)
        console.log(`aT: ${JSON.stringify(user?.email)}`)
    }, [user?.email, isLoading])

    return (
        <>
            {
                isLoading? <div className="w-screen h-screen text-gray-800 dark:text-white/90 flex justify-center items-center">
                        <Loader className="h-64" />
                    </div>
                    : <Outlet />
            }
        </>
    )
}

export default PersistLogin;