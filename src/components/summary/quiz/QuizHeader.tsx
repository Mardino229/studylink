import { Clock, Target } from "lucide-react";

interface QuizHeaderProps {
    currentQuestion: number;
    totalQuestions: number;
    timeLeft: number;
}

export default function QuizHeader({ currentQuestion, totalQuestions, timeLeft }: QuizHeaderProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl" />
            <div className="relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Target className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                                Quiz d'évaluation
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                Question {currentQuestion + 1} sur {totalQuestions}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${timeLeft < 60 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                            <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                        </div>
                        <div className="text-center">
                            <div className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Temps restant</div>
                        </div>
                    </div>
                </div>
                
                {/* Barre de progression moderne */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Progression</span>
                        <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}