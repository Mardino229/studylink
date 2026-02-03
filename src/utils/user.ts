import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {useUser} from "../components/layout/userContext.tsx";
import {useNavigate} from "react-router-dom";
import type {CompleteProfileRequest, UpdateProfileRequest, ValidationError} from "./type.ts";
import {useAxiosPrivate} from "../hoooks/useAxiosPrivate.ts";


const useMe = () => {
    const {setUser} = useUser();
    const axiosPrivate = useAxiosPrivate();

    const {data: me, isPending, isError} = useQuery({
        queryFn: async () =>{
            const response = await axiosPrivate.get('user/me')
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
    const axiosPrivate = useAxiosPrivate();

    return useMutation({
            mutationFn: async (data: CompleteProfileRequest) =>{
                const response = await axiosPrivate.patch('/user/complete-profile', data)
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

const useUpdateProfile = () => {
    const {setUser} = useUser();
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProfileRequest) => {
            const response = await axiosPrivate.put('/user/update', data);
            return response.data;
        },
        onSuccess: (data) => {
            setUser(data);
            queryClient.invalidateQueries({queryKey: ['user']});
            toast.success("Profile updated successfully", {
                description: "Your information has been updated",
            });
        },
        onError: (error) => {
            console.error(error);
            const err = error as unknown as {
                response: {
                    data: {
                        detail: string | ValidationError[]
                    },
                    status: number,
                };
            }
            if (err.response.status === 422) {
                const validationErr = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                }
                toast.error("Validation error", {
                    description: `${validationErr.response.data.detail[0].loc[1]}: ${validationErr.response.data.detail[0].msg}`,
                })
            } else {
                const errDetail = err.response.data.detail as string;
                toast.error("Update failed", {
                    description: errDetail,
                })
            }
        },
    });
}


export { useMe, useCompleteProfile, useUpdateProfile } ;