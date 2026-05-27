import axios from "axios";

export const baseUrl = "http://localhost:8000/api/v1";

const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

export const axiosClient = axios.create({
    baseURL: baseUrl,
    headers: defaultHeaders,
    withCredentials: true,
});

export const axiosPrivate = axios.create({
    baseURL: baseUrl,
    headers: defaultHeaders,
    withCredentials: true,
});
