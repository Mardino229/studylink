import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Montserrat, sans-serif',
    });
  }, [theme]);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="flex justify-center my-6 overflow-x-auto">
        <div ref={ref} className="mermaid transition-all duration-300 bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-w-fit">
            {chart}
        </div>
    </div>
  );
};

export default Mermaid;
