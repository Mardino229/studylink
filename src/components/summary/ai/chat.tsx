import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot } from "lucide-react";
import { autoScrollListRef } from "./use-auto-scroll";
import { cn } from "../../../lib/utils";

interface Message {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
}


const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            sender: "ai",
            text: "Bonjour ! Je suis ton tuteur IA. Comment puis-je t'aider à approfondir ce cours aujourd'hui ?",
            timestamp: new Date()
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Handle auto-scroll with proper cleanup
    useEffect(() => {
        if (scrollContainerRef.current) {
            const cleanup = autoScrollListRef(scrollContainerRef.current);
            return cleanup;
        }
    }, []);

    const sendMessage = (text: string = input) => {
        const trimmedInput = text.trim();
        if (trimmedInput === "") return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: trimmedInput,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponseText = `Voici une réponse simulée pour : "${trimmedInput}". En contexte éducatif, je t'expliquerais les concepts clés avec des exemples pertinents. N'hésite pas à me demander plus de détails !`;
            simulateTyping(aiResponseText);
        }, 1000);
    };

    const simulateTyping = (fullText: string) => {
        const words = fullText.split(" ");
        let currentWordIndex = 0;
        const messageId = (Date.now() + 1).toString();

        setMessages((prev) => [
            ...prev,
            { id: messageId, sender: "ai", text: "", timestamp: new Date() }
        ]);

        typingIntervalRef.current = setInterval(() => {
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                const msgIndex = updatedMessages.findIndex(m => m.id === messageId);

                if (msgIndex === -1) return prevMessages;

                const currentMsg = updatedMessages[msgIndex];
                const nextWord = words[currentWordIndex];

                if (!nextWord) return prevMessages;

                currentMsg.text += (currentMsg.text ? " " : "") + nextWord;
                return updatedMessages;
            });

            currentWordIndex++;
            if (currentWordIndex >= words.length) {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    setIsTyping(false);
                }
            }
        }, 30);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setIsTyping(false);
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };

    useEffect(() => {
        return () => {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        };
    }, []);

    return (
        <div className="flex flex-col h-[65vh] w-full bg-white dark:bg-slate-900">
            {/* Minimal Header */}
            {/*<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Tuteur IA</span>*/}
            {/*        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">Beta</span>*/}
            {/*    </div>*/}
            {/*    <button*/}
            {/*        onClick={clearChat}*/}
            {/*        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"*/}
            {/*        title="Effacer la conversation"*/}
            {/*    >*/}
            {/*        <Eraser className="w-4 h-4" />*/}
            {/*    </button>*/}
            {/*</div>*/}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:p-6 scroll-smooth" ref={scrollContainerRef}>
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Bot className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">Comment puis-je vous aider ?</p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "flex gap-4",
                                    msg.sender === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {/* AI Avatar */}
                                {msg.sender === "ai" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center border border-gray-500/20 mt-1">
                                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </div>
                                )}

                                {/* Message Content */}
                                <div className={cn(
                                    "max-w-[85%] sm:max-w-[75%] text-sm sm:text-base leading-relaxed",
                                    msg.sender === "user"
                                        ? "bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-3xl rounded-tr-sm text-slate-800 dark:text-slate-100"
                                        : "px-1 py-1 text-slate-700 dark:text-slate-200"
                                )}>
                                    {msg.text}
                                </div>

                                {/* User Avatar (Optional, usually ChatGPT doesn't show user avatar, just bubble) */}
                                {/* Keeping it minimal as per request */}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center border border-gray-500/20">
                                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900">
                <div className="max-w-3xl mx-auto">
                    {/* Suggestions */}
                    {/*{messages.length < 2 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q)}
                                    className="text-left px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors truncate"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}*/}

                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Envoyer un message..."
                            className="w-full py-3.5 pl-5 pr-12 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 focus:shadow-sm transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 disabled:opacity-20 disabled:hover:opacity-20 text-white dark:text-slate-900 rounded-full transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400">
                            L'IA peut faire des erreurs. Envisagez de vérifier les informations importantes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
