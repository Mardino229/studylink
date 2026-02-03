import {createContext} from "react";
import type {UserContextProps} from "./utils/type.ts";



export const UserContext = createContext<UserContextProps>({setUser: ()=>{}});


export const STEPS = [
    { id: 'upload', label: 'Validation et Upload' },
    { id: 'summary', label: 'Analyse et Résumé' },
    { id: 'flashcards', label: 'Génération des Flashcards' },
    { id: 'quizzes', label: 'Création du Quiz' },
];