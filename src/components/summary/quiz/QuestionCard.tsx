import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "../../../lib/utils.ts";
import type { Question } from "./quiz-types.ts";

interface QuestionCardProps {
    question: Question;
    selectedAnswer: string;
    textAnswer: string;
    showResult: boolean;
    onAnswerSelect: (answerId: string) => void;
    onTextChange: (value: string) => void;
}

export default function QuestionCard({
    question,
    selectedAnswer,
    textAnswer,
    showResult,
    onAnswerSelect,
    onTextChange
}: QuestionCardProps) {
    return (
        <div className="rounded-xl sm:p-6 ">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed mb-2">
                    {question.question}
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {question.type === "mcq" ? "Sélectionnez une réponse" : "Tapez votre réponse"}
                </div>
            </div>

            {/* QCM simplifié */}
            {question.type === "mcq" && (
                <div className="grid sm:grid-cols-2 gap-6">
                    {question.options?.map((option) => (
                        <label
                            key={option.id}
                            className={cn(
                                "flex items-center p-4 rounded-lg border cursor-pointer transition-all",
                                selectedAnswer === option.id
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                showResult && option.isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                                showResult && selectedAnswer === option.id && !option.isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20"
                            )}
                        >
                            <input
                                type="radio"
                                name="mcq-answer"
                                value={option.id}
                                checked={selectedAnswer === option.id}
                                onChange={() => onAnswerSelect(option.id)}
                                className="sr-only"
                                disabled={showResult}
                            />
                            
                            {/* Radio button simple */}
                            <div className={cn(
                                "flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 transition-all",
                                selectedAnswer === option.id
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300 dark:border-gray-600"
                            )}>
                                {selectedAnswer === option.id && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                            
                            {/* Texte de l'option */}
                            <span className="flex-1 text-gray-900 dark:text-white font-medium">
                                {option.text}
                            </span>
                            
                            {/* Icônes de résultat */}
                            {showResult && option.isCorrect && (
                                <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                            )}
                            {showResult && selectedAnswer === option.id && !option.isCorrect && (
                                <XCircle className="w-5 h-5 text-red-500 ml-2" />
                            )}
                        </label>
                    ))}
                </div>
            )}

            {/* Question à réponse libre */}
            {question.type === "text" && (
                <div className="space-y-4">
                    <input
                        type="text"
                        value={textAnswer}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="Tapez votre réponse ici..."
                        className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                        disabled={showResult}
                    />
                    
                    {showResult && question.correctAnswer && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-800 dark:text-green-200 mb-1">Réponse correcte :</p>
                            <p className="font-semibold text-green-900 dark:text-green-100">
                                {question.correctAnswer}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Explication simple */}
            {showResult && question.explanation && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Explication</h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {question.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}