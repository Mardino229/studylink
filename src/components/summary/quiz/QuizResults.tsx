import { useState } from "react";
import { CheckCircle, XCircle, ArrowLeft, RotateCcw, Eye } from "lucide-react";

import { quizData, getQuestionResult } from "./quiz-types.ts";
import Button from "../../ui/button/Button.tsx";

interface QuizResultsProps {
    score: number;
    total: number;
    answers: Record<number, string>;
    onRestart: () => void;
    onOpenRecap?: () => void; // optional prop to open external recap drawer
    showOnlySummary?: boolean; // when true, render only the recap view
    onCloseRecap?: () => void; // callback to close external recap drawer
}

export default function QuizResults({ score, total, answers, onRestart, onOpenRecap, showOnlySummary, onCloseRecap }: QuizResultsProps) {
    const [showSummary, setShowSummary] = useState(false);
    const percentage = Math.round((score / total) * 100);



    if (showSummary || showOnlySummary) {
        return (
            <div className="space-y-6">
                {/* Header du sommaire */}
                <div className=" space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="sm:text-2xl text-xl font-bold text-gray-900 ">
                            Récapitulatif
                        </h2>
                        <div className={` px-4 py-2 bg-gray-800 text-white rounded-full text-xs sm:text-sm font-medium`}>
                            {score}/{total} • {percentage}%
                        </div>
                    </div>
                </div>

                {/* Liste des questions */}
                <div className="space-y-4">
                    {quizData.map((question, index) => {
                        const result = getQuestionResult(question, answers[question.id] || "");
                        return (
                            <div 
                                key={question.id} 
                                className={`p-6 rounded-2xl border-2 transition-all ${
                                    result.isCorrect 
                                        ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' 
                                        : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                        result.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                        {result.isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                Question {index + 1}
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300 mt-1">
                                                {question.question}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Votre réponse:</span>
                                                <p className={`mt-1 font-medium ${
                                                    result.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                                }`}>
                                                    {result.userAnswer}
                                                </p>
                                            </div>
                                            
                                            {!result.isCorrect && result.correctAnswer && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bonne réponse:</span>
                                                    <p className="mt-1 font-medium text-green-700 dark:text-green-400">
                                                        {result.correctAnswer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {question.explanation && (
                                            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    <strong>💡 Explication:</strong> {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end mb-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (onCloseRecap) {
                                onCloseRecap();
                            } else {
                                setShowSummary(false);
                            }
                        }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour aux résultats
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center space-y-8">
            {/* Animation de célébration */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
            </div>
            
            <div className="flex justify-between items-center ">
                <h2 className="sm:text-2xl text-xl font-bold text-gray-900 bg-clip-text">
                    Quiz terminé !
                </h2>
            </div>

            {/* Carte des résultats moderne */}
            <div className=" rounded-3xl p-8 max-w-md mx-auto ">
                <div className="space-y-6">
                    <div className="text-center">
                        <div className={`text-6xl font-bold text-gray-900 bg-clip-text mb-2`}>
                            {percentage}%
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {score} sur {total} bonnes réponses
                        </p>
                    </div>
                    
                    {/* Barre de progression animée */}
                    <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div 
                                className={`h-4 rounded-full bg-gray-900 transition-all duration-2000 shadow-lg`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse" />
                    </div>
                    
                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
                            <div className="text-xs text-green-600/70 dark:text-green-400/70">Correctes</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{total - score}</div>
                            <div className="text-xs text-red-600/70 dark:text-red-400/70">Incorrectes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex sm:flex-row items-center justify-center gap-4">
                <Button
                    onClick={() => {
                        if (onOpenRecap) {
                            onOpenRecap();
                        } else {
                            setShowSummary(true);
                        }
                    }}
                >
                    <Eye className="w-5 h-5" />
                    Summary
                </Button>
                <Button
                    variant="outline"
                    onClick={onRestart}
                >
                    <RotateCcw className="w-5 h-5" />
                    Recommencer
                </Button>
            </div>
        </div>
    );
}