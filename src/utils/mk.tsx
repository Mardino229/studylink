import ReactMarkdown from 'react-markdown';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import Mermaid from '../components/ui/Mermaid';


export const renderMarkdown = (content: string) => {
    // Normalize literal \n / \t escape sequences to real characters in case
    // the backend double-encoded the string.
    const normalized = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
                h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 leading-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-7 mb-3 leading-tight border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mt-5 mb-2">{children}</h3>,
                h4: ({ children }) => <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2">{children}</h4>,
                p: ({ children }) => <p className="my-3 leading-7 text-gray-700 dark:text-gray-300">{children}</p>,
                ul: ({ children }) => <ul className="my-3 ml-6 list-disc space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 ml-6 list-decimal space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>,
                li: ({ children }) => <li className="leading-7 pl-1">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ href, children }) => <a href={href} className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">{children}</a>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-500 dark:text-gray-400">{children}</blockquote>,
                hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
                table: ({ children }) => (
                    <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full border-collapse">{children}</table>
                    </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800/60">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
                tr: ({ children }) => <tr className="even:bg-gray-50/50 dark:even:bg-white/[0.02]">{children}</tr>,
                th: ({ children }) => <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{children}</th>,
                td: ({ children }) => <td className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{children}</td>,
                pre: ({ node, children }) => {
                    // If the pre contains a mermaid code block, skip the pre wrapper
                    // so the Mermaid component can render unobstructed.
                    const hasMermaid = (node as { children?: { tagName?: string; properties?: { className?: string[] } }[] })
                        ?.children?.some(
                            (c) => c.tagName === 'code' && c.properties?.className?.some((cls) => cls.includes('mermaid'))
                        );
                    if (hasMermaid) return <>{children}</>;
                    return (
                        <pre className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 my-4 overflow-x-auto text-sm font-mono leading-relaxed">
                            {children}
                        </pre>
                    );
                },
                code({ className, children, ...props }: React.ComponentProps<'code'> & { className?: string; children?: React.ReactNode }) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (match && match[1] === 'mermaid') {
                        return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                    }
                    if (match) {
                        return <code className="text-sm font-mono" {...props}>{children}</code>;
                    }
                    return (
                        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-200" {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {normalized}
        </ReactMarkdown>
    );
};
