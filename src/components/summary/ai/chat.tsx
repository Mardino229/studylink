
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {autoScrollListRef} from "./use-auto-scroll.tsx";
import Button from "../../ui/button/Button.tsx";
import {SendIcon} from "lucide-react";

interface Message {
    sender: "user" | "ai";
    text: string;
}

const PreviewUseAutoScroll = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: "ai", text: "Welcome to the chat!" },
    ]);
    const [input, setInput] = useState("");

    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const sendMessage = () => {
        const trimmedInput = input.trim();
        if (trimmedInput === "") {
            return;
        }

        const userMessage: Message = { sender: "user", text: trimmedInput };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Simulate AI response
        const aiResponse = `Sint nisi eu cillum nulla officia incididunt irure laboris enim cillum cupidatat occaecat. 
Duis adipisicing veniam exercitation quis anim. Exercitation consectetur tempor et consectetur dolor. 
Cupidatat culpa eiusmod ex enim occaecat dolor sunt. Et et commodo qui ipsum nostrud ut et incididunt est cupidatat excepteur laborum. 
Anim ullamco aliqua ad sit sint cupidatat esse esse.`;

        // Break down the AI response into words
        const words = aiResponse.split(" ");
        let currentWordIndex = 0;

        // Add a placeholder AI message first, so we have something to update
        const newAiMessageIndex = messages.length + 1; // next index after user's message
        setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

        // Type out each word at a fixed interval
        typingIntervalRef.current = setInterval(() => {
            setMessages((prevMessages) => {
                // Ensure the AI message exists
                if (!prevMessages[newAiMessageIndex]) {
                    return prevMessages;
                }

                // Update the AI message with the next word
                const updatedMessages = [...prevMessages];
                const currentAiMessage = updatedMessages[newAiMessageIndex];

                currentAiMessage.text +=
                    (currentAiMessage.text ? " " : "") + words[currentWordIndex];

                currentWordIndex++;

                // If we've reached the end of all words, clear the interval
                if (currentWordIndex >= words.length) {
                    if (typingIntervalRef.current) {
                        clearInterval(typingIntervalRef.current);
                        typingIntervalRef.current = null;
                    }
                }

                return updatedMessages;
            });
        }, 100); // 100ms per word
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup if component unmounts
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="max-w-6xl  mx-auto bg-white dark:bg-neutral-800 border border-neutral-400/20 rounded-xl">

            <h2 className="text-2xl rounded-t-3xl p-4 text-white bg-gray-800 border-b-2 font-semibold  text-left">
                Your ai tutor
            </h2>
            <MessageList messages={messages} />
            <div className="px-4 pb-4 flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="rounded-lg p-4 bg-neutral-400/20 border border-neutral-400/20 w-full placeholder:text-neutral-400"
                />
                <Button
                    onClick={sendMessage}
                    className=" px-4"
                >
                    <SendIcon />
                </Button>
            </div>
        </div>
    );
};

interface MessageListProps {
    messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
    return (
        <ul
            ref={autoScrollListRef}
            className="px-4 pt-2 h-[calc(44vh)] sm:h-[calc(40vh)] overflow-y-auto mb-4 space-y-2 rounded-md"
        >
            {messages.map((msg, index) => (
                <MessageItem key={`${index}-${msg.sender}-${msg.text}`} message={msg} />
            ))}
        </ul>
    );
};

interface MessageItemProps {
    message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
    return (
        <li
            className={`flex w-full ${
                message.sender === "user" ? "justify-end" : "justify-start"
            }`}
        >
            <p
                className={`p-3 rounded-lg text-justify max-w-xl break-words ${ 
                    message.sender === "user"
                        ? "bg-primary text-white" 
                        : "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200" 
                }`}
            >
                {message.text}
            </p>
        </li>
    );
};

export default PreviewUseAutoScroll;
