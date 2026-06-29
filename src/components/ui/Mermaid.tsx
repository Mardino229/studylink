import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

let idCounter = 0;

const sanitizeMermaid = (chart: string): string =>
    chart
        // Quote square-bracket node labels that contain bare parentheses.
        // e.g. [Load Balancer (Nginx)] → ["Load Balancer (Nginx)"]
        .replace(/\[(?!")([^\]]*\([^\]]*)\]/g, (_, c) => `["${c}"]`)
        // Quote curly-brace (diamond) labels with bare parentheses.
        // e.g. {Conversion (vecteur)} → {"Conversion (vecteur)"}
        .replace(/\{(?!")([^}]*\([^}]*)\}/g, (_, c) => `{"${c}"}`)
        // Quote subgraph titles that contain parentheses.
        // e.g. subgraph Phase d'indexation (une fois) → subgraph "Phase d'indexation (une fois)"
        .replace(
            /^(\s*subgraph\s+)(?!")([^\n]+\([^\n]*)$/gm,
            (_, pre, title) => `${pre}"${title.trim()}"`,
        )
        // Replace bare `note "..."` lines — valid only in sequence diagrams, not
        // flowcharts. Convert to a Mermaid comment (%%) to avoid parse errors.
        .replace(/^(\s*)note\s+"[^"]*"\s*$/gm, '$1%%');

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!ref.current || !chart) return;

        const container = ref.current;
        const id = `mermaid-diagram-${++idCounter}`;
        // Guard against React StrictMode double-invoke: the cleanup sets this to
        // true so the stale promise callback never updates state or the DOM.
        let cancelled = false;

        setError(false);

        mermaid.initialize({
            startOnLoad: false,
            theme: resolvedTheme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'Figtree, sans-serif',
        });

        mermaid
            .render(id, sanitizeMermaid(chart))
            .then(({ svg }) => {
                if (!cancelled && container) container.innerHTML = svg;
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });

        return () => {
            cancelled = true;
        };
    }, [chart, resolvedTheme]);

    if (error) {
        return (
            <div className="my-6 space-y-2">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Diagramme — syntaxe non supportée, affichage en texte brut :
                </p>
                <pre className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    {chart}
                </pre>
            </div>
        );
    }

    return (
        <div className="flex justify-center my-6 overflow-x-auto">
            <div
                ref={ref}
                className="transition-all duration-300 bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-w-fit"
            />
        </div>
    );
};

export default Mermaid;
