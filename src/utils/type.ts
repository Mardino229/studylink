import type {Dispatch, SetStateAction} from "react";

export interface ValidationError {
    type: string;
    loc: string[];
    msg: string;
}

export type CompleteProfileRequest = {
    first_name: string; last_name: string; study_level_id: string; faculty_id?: string; program_id?: string; other_program?: string;
}

export type UpdateProfileRequest = {
    first_name: string;
    last_name: string;
    email: string;
    study_level_id?: string;
    faculty_id?: string;
    program_id?: string;
    other_program?: string;
}

export type LoginFormRequest = {
    email: string;
    password: string;
}

export type RegisterFormRequest = {
    email: string;
    password: string;
    confirmPassword: string;
}

export type User = {
    first_name?: string;
    last_name?: string;
    email?: string;
    receiver?: string;
    is_active?: boolean;
    is_admin?: boolean;
    other_program?: string;
    study_level_id?: number | null;
    faculty_id?: number | null;
    program_id?: number | null;
    program?: {name: string};
    faculty?: {name: string};
    study_level?: {name: string};
}

export type UserContextProps = {
    user?: User;
    setUser: Dispatch<SetStateAction<User>>;
};