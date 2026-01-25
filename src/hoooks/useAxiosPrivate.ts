
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken.ts";
import { axiosPrivate } from "../utils/api.ts";
import {useUser} from "../components/layout/userContext.tsx";

export const useAxiosPrivate = () => {
    const { user } = useUser();
    const refresh = useRefreshToken();

    useEffect(() => {

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if ((error?.response?.status === 401 || error?.response?.status === 403) && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    await refresh();
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [user, refresh])

    return axiosPrivate;
}

