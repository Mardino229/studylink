import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { toolbarPlugin, type TransformToolbarSlot } from '@react-pdf-viewer/toolbar';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
// @ts-ignore   Vite ?url import for the local pdfjs worker
import WORKER_URL from 'pdfjs-dist/build/pdf.worker.min.js?url';

type Props = {
    pdfUrl: string | null;
    title?: string;
    onClose: () => void;
};

export default function PdfViewerModal({ pdfUrl, title, onClose }: Props) {
    const toolbarPluginInstance = toolbarPlugin();
    const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

    const transform: TransformToolbarSlot = (slot) => ({
        ...slot,
        Download: () => <></>,
        DownloadMenuItem: () => <></>,
        Print: () => <></>,
        PrintMenuItem: () => <></>,
        Open: () => <></>,
        OpenMenuItem: () => <></>,
        SwitchTheme: () => <></>,
        SwitchThemeMenuItem: () => <></>,
    });

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!pdfUrl) return null;

    return (
        <div className="fixed  w-xl inset-0 z-[999] flex flex-col bg-gray-950">
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
                <p className="truncate text-sm font-semibold text-white max-w-[70%]">
                    {title ?? 'Corrigé'}
                </p>
                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Fermer"
                >
                    <X size={18} />
                </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden"> 
                <Worker workerUrl={WORKER_URL}>
                    <div className="h-full flex flex-col">
                        <div className="border-b border-white/10 bg-gray-900 px-2 py-1">
                            <Toolbar>
                                {renderDefaultToolbar(transform)}
                            </Toolbar>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-800">
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[toolbarPluginInstance]}
                                defaultScale={SpecialZoomLevel.PageWidth}
                                theme="dark"
                            />
                        </div>
                    </div>
                </Worker>
            </div>
        </div>
    );
}
