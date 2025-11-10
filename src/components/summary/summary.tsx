
import { useState } from "react";
import { FileText, Layers, HelpCircle, MessageSquare } from "lucide-react";
import Flashcards from "./flashcards/flashcards.tsx";
import Quiz from "./quiz/quiz.tsx";
import PreviewUseAutoScroll from "./ai/chat.tsx";

export default function SummaryTabs() {
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
                                className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
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
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                                    Points clés
                                </h3>
                                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        Premier point important du document résumé
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        Deuxième concept essentiel à retenir
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        Troisième élément crucial pour la compréhension
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Résumé détaillé
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Ce document traite des concepts fondamentaux et présente une analyse approfondie du sujet principal. Les informations sont organisées de manière logique pour faciliter la compréhension et l'apprentissage progressif.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    L'objectif principal est de fournir une base solide de connaissances qui peut être approfondie par la suite grâce aux outils interactifs disponibles dans les autres sections.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === "flashcards" && (
                    <div className="p-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-12 md:mb-24">
                            Flashcards de révision
                        </h2>
                        <div className="flex items-center mb-6 justify-center">
                            <Flashcards />
                        </div>
                    </div>
                )}
                
                {activeTab === "quiz" && (
                    <div className="sm:p-6 p-2">
                        <Quiz />
                    </div>
                )}
                
                {activeTab === "ai" && (
                    <div className="sm:p-6 p-3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Posez vos questions à l'IA
                        </h2>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <PreviewUseAutoScroll />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
