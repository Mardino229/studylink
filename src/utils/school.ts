import {useQuery} from "@tanstack/react-query";
import {axiosClient} from "./api.ts";

export type StudyLevel = {
    id: number;
    name: string;
}

export type Faculty = {
    id: number;
    name: string;
}

export type Program = {
    id: number;
    name: string;
    faculty_id?: number;
}

const StudyLevels = () => {
    const {data, isPending, isError} = useQuery({
        queryFn: async (): Promise<StudyLevel[]> =>{
            const response = await axiosClient.get('school/study-levels')
            console.log(response.data.user)
            return response.data;
        },
        queryKey: ['study_levels'],
    })

    return { data, isPending, isError };
}

const Faculties = () => {
    const {data, isPending, isError} = useQuery({
        queryFn: async (): Promise<Faculty[]> =>{
            const response = await axiosClient.get('school/faculties')
            return response.data
        },
        queryKey: ['faculties'],
    })

    return { data, isPending, isError };
}

const Programs = () => {
    const {data, isPending, isError} = useQuery({
        queryFn: async (): Promise<Program[]> =>{
            const response = await axiosClient.get(`school/programs`)
            return response.data
        },
        queryKey: ['programs'],
    })

    return { data, isPending, isError };
}

const ProgramsByFaculty = (id: number) => {
    const {data, isPending, isError} = useQuery({
        queryFn: async (): Promise<Program[]> =>{
            const response = await axiosClient.get(`school/programs/${id}`)
            return response.data
        },
        queryKey: ['programs', id],
    })

    return { data, isPending, isError };
}

export  {StudyLevels, Faculties, Programs, ProgramsByFaculty}
