import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from "./api.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/layout/userContext.tsx";
import { clearUnlockedSolutions } from "./exam.ts";
import type { LoginFormRequest, RegisterFormRequest, ValidationError } from "./type.ts";
import type { AxiosError } from "axios";
import i18n from '../i18n/index.ts';

// Rate-limit body is {"error": "..."}, distinct from the standard {"detail": "..."}
const getRateLimitMsg = (error: AxiosError): string | null => {
    if (error.response?.status !== 429) return null;
    const data = error.response.data as Record<string, string>;
    return data?.error ?? data?.detail ?? i18n.t('auth:common.too_many_title');
};


const useLogin = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: LoginFormRequest) => {
            const response = await axiosClient.post('auth/login', data)
            const userData = response.data.data.user;
            setUser(userData)
            return {
                success: true,
                user: userData,
            };
        },
        onSuccess: (data) => {
            toast.success(i18n.t('auth:login.toast_success_title'), {
                description: i18n.t('auth:login.toast_success_desc'),
            });

            if (data.user.is_active) {
                if (data.user.role?.name === 'admin') {
                    navigate('/admin/home');
                } else if (data.user.study_level_id === null) {
                    navigate('/complete-profile');
                } else {
                    navigate(`/home`);
                }
            } else {
                navigate(`/confirm`);
            }
        },
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error(i18n.t('auth:login.toast_failed'), {
                    description: i18n.t('auth:common.service_unavailable'),
                });
                return;
            }

            const rateLimitMsg = getRateLimitMsg(axiosError);
            if (rateLimitMsg) {
                toast.error(i18n.t('auth:common.too_many_title'), { description: rateLimitMsg });
                return;
            }

            const err = error as unknown as {
                response: {
                    data: {
                        detail: string
                    },
                    status: number,
                };
            }
            if (err.response.status === 403) {
                const err403 = error as unknown as {
                    response: {
                        data: {
                            detail: {
                                message: string,
                                email: string
                            }
                        },
                        status: number,
                    };
                }
                toast.error(i18n.t('auth:login.toast_validate_title'), {
                    description: err403.response.data.detail.message,
                });
                navigate(`/confirm?email=${err403.response.data.detail.email}`);
            } else {
                toast.error(i18n.t('auth:login.toast_failed'), {
                    description: err.response.data.detail,
                });
            }
            return {
                success: false,
                message: error.message,
            };
        },
    })
    return { mutate, isPending };
}

const useRegister = () => {

    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: RegisterFormRequest) => {
            const response = await axiosClient.post('/auth/register', data)
            toast.success(response.data.message, {
                description: "We have received a code to verify your account.",
            })
            navigate(`/confirm?email=${data.email}`);
        },
        onSuccess: () => {},
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error(i18n.t('auth:register.toast_failed'), {
                    description: i18n.t('auth:common.service_unavailable'),
                });
                return;
            }

            const rateLimitMsg = getRateLimitMsg(axiosError);
            if (rateLimitMsg) {
                toast.error(i18n.t('auth:common.too_many_title'), { description: rateLimitMsg });
                return;
            }

            const err = error as unknown as {
                response: {
                    data: {
                        detail: string | ValidationError[]
                    },
                    status: number,
                };
            };

            if (err.response.status === 422) {
                const validationErr = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                };
                toast.error(i18n.t('auth:register.toast_failed'), {
                    description: `${validationErr.response.data.detail[0].loc[1]}: ${validationErr.response.data.detail[0].msg}`,
                });
            } else {
                toast.error(i18n.t('auth:register.toast_failed'), {
                    description: typeof err.response.data.detail === 'string'
                        ? err.response.data.detail
                        : "An error occurred",
                });
            }
        },
    });
}

const useVerify = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    return useMutation({
        mutationFn: async (data: { email: string | null; otp: string; }) => {
            const response = await axiosClient.post('/auth/verify-otp', data);
            const userData = response.data.data?.user ?? null;
            if (userData) setUser(userData);
            return { user: userData };
        },
        onSuccess: ({ user }) => {
            if (user) {
                toast.success(i18n.t('auth:confirm.toast_activated_title'), {
                    description: i18n.t('auth:confirm.toast_activated_desc'),
                });
                if (user.role?.name === 'admin') navigate('/admin/home');
                else if (user.study_level_id === null) navigate('/complete-profile');
                else navigate('/home');
            } else {
                toast.success(i18n.t('auth:confirm.toast_already_title'), {
                    description: i18n.t('auth:confirm.toast_already_desc'),
                });
                navigate('/login');
            }
        },
        onError: (error) => {

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error(i18n.t('auth:common.operation_failed'), {
                    description: i18n.t('auth:common.service_unavailable'),
                });
                return;
            }

            if (axiosError.response.status === 429) {
                const data = axiosError.response.data as Record<string, string>;
                if (data?.detail?.toLowerCase().includes("too many failed")) {
                    toast.error(i18n.t('auth:common.too_many_otp_title'), {
                        description: i18n.t('auth:common.too_many_otp_desc'),
                    });
                } else {
                    toast.error(i18n.t('auth:common.too_many_title'), { description: getRateLimitMsg(axiosError)! });
                }
                return;
            }

            const err = error as unknown as {
                response: {
                    data: {
                        detail: string
                    },
                    status: number,
                };
            }
            if (err.response.status === 422) {
                const err422 = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                }
                toast.error(i18n.t('auth:common.validation_failed'), {
                    description: `${err422.response.data.detail[0].loc[1]}: ${err422.response.data.detail[0].msg}`,
                })
            } else {
                toast.error(i18n.t('auth:common.verification_failed'), {
                    description: err.response.data.detail,
                })
            }
        },
    })
}

const useLogout = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await axiosClient.post('/auth/logout ');
            clearUnlockedSolutions(user?.id);
            queryClient.clear();
            setUser({});
            toast.success(i18n.t('auth:common.logout_success'));
        },
        onSuccess: () => {
            navigate(`/`);
        },
        onError: (error) => {
            const axiosError = error as AxiosError;
            if (!axiosError.response) {
                toast.error(i18n.t('auth:common.logout_failed'), {
                    description: i18n.t('auth:common.service_unavailable'),
                });
                return;
            }
        }
    });
};

const useRequestPassword = () => {
    return useMutation({
        mutationFn: async (data: { to_email: string }) => {
            const response = await axiosClient.post('/auth/request-password-reset', data);
            toast.success(response.data.message, {
                description: "We've sent a reset password link to your email",
            })
        },
        onSuccess: () => {},
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error(i18n.t('auth:common.operation_failed'), {
                    description: i18n.t('auth:common.service_unavailable'),
                });
                return;
            }

            const rateLimitMsg = getRateLimitMsg(axiosError);
            if (rateLimitMsg) {
                toast.error(i18n.t('auth:common.too_many_title'), { description: rateLimitMsg });
                return;
            }

            const err = error as unknown as {
                response: {
                    data: {
                        detail: string
                    },
                    status: number,
                };
            }
            if (err.response.status === 422) {
                const err422 = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                }
                toast.error(i18n.t('auth:reset.toast_failed'), {
                    description: `${err422.response.data.detail[0].loc[1]}: ${err422.response.data.detail[0].msg}`,
                })
            } else {
                toast.error(i18n.t('auth:reset.toast_failed'), {
                    description: err.response.data.detail,
                })
            }
        }
    });
};

const useResetPassword = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: { token: string | null, password: string, confirmPassword: string }) => {
            const response = await axiosClient.post('/auth/reset-password', data);
            toast.success(response.data.message, {
                description: i18n.t('auth:reset_password.toast_success_desc'),
            })
        },
        onSuccess: () => {
            navigate(`/login`);
        },
        onError: (error) => {
            console.error(error);

            const axiosError = error as AxiosError;

            if (!axiosError.response) {
                toast.error(i18n.t('auth:common.operation_failed'), {
                    description: i18n.t('auth:common.service_unavailable'),
                });
                return;
            }

            const rateLimitMsg = getRateLimitMsg(axiosError);
            if (rateLimitMsg) {
                toast.error(i18n.t('auth:common.too_many_title'), { description: rateLimitMsg });
                return;
            }

            const err = error as unknown as {
                response: {
                    data: {
                        detail: string
                    },
                    status: number,
                };
            }
            if (err.response.status === 422) {
                const err422 = error as unknown as {
                    response: {
                        data: {
                            detail: ValidationError[]
                        }
                    };
                }
                toast.error(i18n.t('auth:reset_password.toast_failed'), {
                    description: `${err422.response.data.detail[0].loc[1]}: ${err422.response.data.detail[0].msg}`,
                })
            } else {
                toast.error(i18n.t('auth:reset_password.toast_failed'), {
                    description: err.response.data.detail,
                })
            }
        }
    });
};


const useResendOtp = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: async (email: string) => {
            const response = await axiosClient.post<{ success: boolean; message: string }>('/auth/resend-otp', { email });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.message === "Account already activated") {
                toast.success(i18n.t('auth:confirm.toast_already_title'), {
                    description: i18n.t('auth:confirm.toast_already_desc'),
                });
                navigate('/login');
            } else {
                toast.success(i18n.t('auth:confirm.toast_resent_title'), {
                    description: i18n.t('auth:confirm.toast_resent_desc'),
                });
            }
        },
        onError: (error) => {
            const axiosError = error as AxiosError;
            if (!axiosError.response) {
                toast.error(i18n.t('auth:common.service_unavailable_title'), {
                    description: i18n.t('auth:common.service_unavailable'),
                });
                return;
            }
            const rateLimitMsg = getRateLimitMsg(axiosError);
            if (rateLimitMsg) {
                toast.error(i18n.t('auth:common.too_many_title'), { description: rateLimitMsg });
                return;
            }
            toast.error(i18n.t('auth:common.error'), {
                description: (axiosError.response.data as { detail?: string })?.detail ?? "An error occurred.",
            });
        },
    });
};

export { useLogin, useRegister, useVerify, useLogout, useRequestPassword, useResetPassword, useResendOtp };
