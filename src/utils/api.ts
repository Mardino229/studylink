import axios from "axios";
import i18n from "../i18n/index.ts";

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

const setLangHeader = (config: import("axios").InternalAxiosRequestConfig) => {
    config.headers['Accept-Language'] = i18n.language.startsWith('fr') ? 'fr' : 'en';
    return config;
};

axiosClient.interceptors.request.use(setLangHeader);
axiosPrivate.interceptors.request.use(setLangHeader);
