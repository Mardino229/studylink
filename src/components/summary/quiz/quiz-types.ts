import type { QuizQuestion } from "../../../utils/summary.ts";

export interface QuizAnswer {
    questionIndex: number;
    answer: string;
}

export interface QuestionResult {
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer?: string;
}

export const getQuestionResult = (question: QuizQuestion, userAnswer: string): QuestionResult => {
    if (!userAnswer) return { isCorrect: false, userAnswer: "Pas de réponse" };
    
    if (question.type === "mcq") {
        const isCorrect = userAnswer === question.correct_answer;
        return {
            isCorrect,
            userAnswer,
            correctAnswer: question.correct_answer
        };
    } else {
        // Pour les questions ouvertes, on compare avec la réponse attendue
        const correctAnswer = question.answer || "";
        // On peut faire une comparaison simple ou plus sophistiquée selon les besoins
        const isCorrect = userAnswer.toLowerCase().trim().includes(correctAnswer.toLowerCase().trim().substring(0, 50));
        return {
            isCorrect,
            userAnswer,
            correctAnswer
        };
    }
};