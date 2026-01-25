import axios from "axios";

export const baseUrl = " http://localhost:8000";


export const axiosClient = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true,
});

export const axiosPrivate = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true,
});
