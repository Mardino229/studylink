
import { useState } from "react";
import { FileText, Layers, HelpCircle, MessageSquare } from "lucide-react";
import Flashcards from "./flashcards/flashcards.tsx";
import Quiz from "./quiz/quiz.tsx";
import PreviewUseAutoScroll from "./ai/chat.tsx";
import type { Summary } from "../../utils/summary.ts";
import ReactMarkdown from "react-markdown";

interface SummaryTabsProps {
    summary: Summary;
}

export default function SummaryTabs({ summary }: SummaryTabsProps) {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Résumé", icon: FileText },
        { id: "flashcards", label: "Flashcards", icon: Layers },
        { id: "quiz", label: "Quiz", icon: HelpCircle },
        { id: "ai", label: "Questions IA", icon: MessageSquare },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Navigation horizontale simple */}
            <div className=" dark:border-gray-800 mb-6">
                <nav className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <IconComponent className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>
            {/* Contenu des onglets */}
            <div className=" rounded-lg  dark:border-gray-800 overflow-hidden">
                {activeTab === "overview" && (
                    <div className="sm:p-6 p-3">
                        <div className="prose dark:prose-invert max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Résumé du document
                            </h2>
                            {summary.content_markdown ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown>{summary.content_markdown}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Aucun contenu disponible pour ce résumé.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "flashcards" && (
                    <div className="p-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                            Flashcards de révision
                        </h2>
                        <div className="flex items-center mb-6 justify-center">
                            <Flashcards flashcards={summary.flashcards || []} />
                        </div>
                    </div>
                )}

                {activeTab === "quiz" && (
                    <div className="sm:p-6 p-2">
                        <Quiz quizzes={summary.quizzes || []} />
                    </div>
                )}

                {activeTab === "ai" && (
                    <div className="w-full h-full">
                        <PreviewUseAutoScroll />
                    </div>
                )}
            </div>
        </div>
    );
}
