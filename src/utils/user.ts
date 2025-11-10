import {useMutation, useQuery} from "@tanstack/react-query";
import {axiosClient} from "./api.ts";
import {toast} from "sonner";
import {useUser} from "../components/layout/userContext.tsx";
import {useNavigate} from "react-router-dom";
import type {CompleteProfileRequest, ValidationError} from "./type.ts";


const useMe = () => {
    const {setUser} = useUser();
    const {data: me, isPending, isError} = useQuery({
        queryFn: async () =>{
            const response = await axiosClient.get('auth/me')
            console.log(response.data.user)
            setUser(response.data.user)
            toast('Welcome back !');
            return {
                success: true,
                user: response.data.user,
            };
        },
        queryKey: ['user'],
    })
    return { me, isPending, isError };
}


const useCompleteProfile = () => {

    const navigate = useNavigate();
    const {setUser} = useUser();
    return useMutation({
            mutationFn: async (data: CompleteProfileRequest) =>{
                const response = await axiosClient.patch('/user/complete-profile', data)
                setUser(response.data)
                toast.success(response.data.message, {
                    description: "Profile completed successfully",
                })
            },
            onSuccess: () => {
                navigate(`/home`);
            },
            onError: (error) => {
                console.error(error);
                const err = error as unknown as {
                    response: {
                        data: {
                            detail: string
                        },
                        status: number,
                    };
                }
                console.log(err.response.status === 422)
                if (err.response.status === 422) {
                    const err = error as unknown as {
                        response: {
                            data: {
                                detail:  ValidationError[]
                            }
                        };
                    }
                    toast.error("Operation failed", {
                        description: `${err.response.data.detail[0].loc[1]}: ${err.response.data.detail[0].msg}`,
                    })
                } else {
                    toast.error("Operation failed", {
                        description: err.response.data.detail,
                    })
                }
            },
        }
    );
}


export { useMe, useCompleteProfile } ;