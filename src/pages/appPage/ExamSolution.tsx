import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, Loader2, Zap, Sparkles } from 'lucide-react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { toolbarPlugin, type TransformToolbarSlot } from '@react-pdf-viewer/toolbar';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
// @ts-ignore   Vite ?url import
import WORKER_URL from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { useQueryClient } from '@tanstack/react-query';
import { useAxiosPrivate } from '../../hoooks/useAxiosPrivate';
import UpgradeModal from '../../components/ui/UpgradeModal';
import PageMeta from '../../components/common/PageMeta';
import { useTranslation } from 'react-i18next';

type Status = 'loading' | 'success' | 'error402' | 'error404' | 'error';

export default function ExamSolution() {
    const { t } = useTranslation('exams');
    const { examId } = useParams<{ examId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const title = searchParams.get('title') ?? t('solution.page_title');
    const endpoint = searchParams.get('endpoint');
    const cost = Number(searchParams.get('cost') ?? '2');

    const queryClient = useQueryClient();

    const [status, setStatus] = useState<Status>('loading');
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [isImage, setIsImage] = useState(false);
    const [upgradeOpen, setUpgradeOpen] = useState(false);

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
        if (!examId && !endpoint) return;
        let revoked = false;
        setStatus('loading');
        setFileUrl(null);
        setIsImage(false);

        const fetchUrl = endpoint || `/exam-library/${examId}/solution`;

        const fetchFile = async () => {
            try {
                const response = await axiosPrivate.get(fetchUrl, { responseType: 'blob' });
                const contentType: string = response.headers['content-type'] || 'application/pdf';
                const blob = new Blob([response.data], { type: contentType });
                const url = URL.createObjectURL(blob);
                if (!revoked) {
                    setFileUrl(url);
                    setIsImage(contentType.startsWith('image/'));
                    setStatus('success');
                    if (!endpoint && examId) {
                        queryClient.invalidateQueries({ queryKey: ['token-balance'] });
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 402) setStatus('error402');
                    else if (error.response?.status === 404) setStatus('error404');
                    else setStatus('error');
                } else {
                    setStatus('error');
                }
            }
        };

        fetchFile();

        return () => {
            revoked = true;
            if (fileUrl) URL.revokeObjectURL(fileUrl);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId, endpoint]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
            <PageMeta title={title} description={t('solution.page_title')} />

            {/* Header */}
            <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-white/10 dark:bg-gray-900">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={t('solution.back')}
                >
                    <ArrowLeft size={18} />
                </button>
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Loading */}
                {status === 'loading' && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
                        <Loader2 size={40} className="animate-spin text-blue-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">{endpoint ? t('solution.loading_exam') : t('solution.loading')}</p>
                    </div>
                )}

                {/* File viewer */}
                {status === 'success' && fileUrl && (
                    isImage ? (
                        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-50 p-4 dark:bg-gray-800">
                            <img
                                src={fileUrl}
                                alt={title}
                                className="max-h-full max-w-full rounded-lg object-contain shadow-md"
                            />
                        </div>
                    ) : (
                        <Worker workerUrl={WORKER_URL}>
                            <div className="flex h-full flex-col">
                                <div className="border-b border-gray-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-gray-800">
                                    <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                                </div>
                                <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-700">
                                    <Viewer
                                        fileUrl={fileUrl}
                                        plugins={[toolbarPluginInstance]}
                                        defaultScale={SpecialZoomLevel.PageWidth}
                                    />
                                </div>
                            </div>
                        </Worker>
                    )
                )}

                {/* 402   Insufficient tokens */}
                {status === 'error402' && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
                            <Lock size={36} className="text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('solution.unauthorized_title')}</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {t('solution.paywall_desc', { count: cost })}
                                <br />{t('solution.paywall_note')}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => setUpgradeOpen(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                            >
                                <Zap size={16} />
                                {t('solution.buy_tokens')}
                            </button>
                            <button
                                onClick={() => navigate('/subscription')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                            >
                                <Sparkles size={16} />
                                {t('solution.go_pro')}
                            </button>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <ArrowLeft size={12} className="inline-block" /> {t('solution.back_to_library')}
                        </button>
                    </div>
                )}
                

                {/* 404 — file not found (exam download vs solution) */}
                {status === 'error404' && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                            <Lock size={28} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {endpoint ? t('solution.exam_unavailable_title') : t('solution.unavailable_title')}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {endpoint ? t('solution.exam_unavailable_desc') : t('solution.unavailable_desc')}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <ArrowLeft size={12} className="inline-block" /> {t('solution.back_to_library')}
                        </button>
                    </div>
                )}

                {/* Generic error */}
                {status === 'error' && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('solution.error_title')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('solution.error_desc')}
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <ArrowLeft size={12} className="inline-block" /> {t('solution.back_to_library')}
                        </button>
                    </div>
                )}
            </div>

            <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
        </div>
    );
}
