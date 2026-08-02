import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, HelpCircle, Bug, Lightbulb, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { useSubmitSupportTicket, type TicketType } from "../../utils/support";
import { useTranslation } from "react-i18next";

interface SupportWidgetProps {
    requireEmail?: boolean;
}

export default function SupportWidget({ requireEmail = false }: SupportWidgetProps) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<TicketType>("feedback");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    const { mutateAsync, isPending } = useSubmitSupportTicket();
    const { t } = useTranslation('app');

    const TICKET_TYPES: { value: TicketType; label: string; icon: React.ReactNode }[] = [
        { value: "report_issue",    label: t('support_widget.type_bug'),     icon: <Bug size={14} /> },
        { value: "feature_request", label: t('support_widget.type_feature'), icon: <Lightbulb size={14} /> },
        { value: "get_help",        label: t('support_widget.type_help'),    icon: <HelpCircle size={14} /> },
        { value: "feedback",        label: t('support_widget.type_review'),  icon: <MessageSquare size={14} /> },
    ];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) return;
        await mutateAsync({ type, message: message.trim(), ...(requireEmail ? { email } : {}) });
        setDone(true);
        setMessage("");
        setEmail("");
    }

    function handleClose() {
        setOpen(false);
        setTimeout(() => setDone(false), 300);
    }

    return (
        <>
            {/* Floating button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t('support_widget.title')}
                className="fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-colors hover:scale-105 active:scale-95"
            >
                <HelpCircle size={22} />
            </button>

            {/* Overlay */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            onClick={handleClose}
                        />

                        {/* Panel */}
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, y: 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.97 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="fixed bottom-24 right-6 z-50 w-[80vw] lg:w-[340px] rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                                        <HelpCircle size={15} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('support_widget.title')}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                {done ? (
                                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('support_widget.done_title')}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('support_widget.done_desc')}</p>
                                        <button
                                            onClick={() => setDone(false)}
                                            className="mt-1 text-xs font-medium text-brand-500 hover:underline"
                                        >
                                            {t('support_widget.done_send_another')}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Type pills */}
                                        <div className="flex flex-wrap gap-2">
                                            {TICKET_TYPES.map(({ value, label, icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setType(value)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                                                        type === value
                                                            ? "bg-brand-500 border-brand-500 text-white"
                                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300 hover:text-brand-500"
                                                    }`}
                                                >
                                                    {icon}
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Email (anonymous only) */}
                                        {requireEmail && (
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder={t('support_widget.email_placeholder')}
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:focus:border-brand-700 transition-colors"
                                            />
                                        )}

                                        {/* Message */}
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                            rows={4}
                                            placeholder={t('support_widget.message_placeholder')}
                                            className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:focus:border-brand-700 transition-colors"
                                        />

                                        <button
                                            type="submit"
                                            disabled={isPending || !message.trim()}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPending && <Loader2 size={14} className="animate-spin" />}
                                            {t('support_widget.send_btn')}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
