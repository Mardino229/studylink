import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useCreateNotebook } from '../../utils/workspace';
import { useUser } from '../../components/layout/userContext.tsx';
import AuthLayout from '../../components/layout/authLayout.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Button } from '../../components/ui/button.tsx';
import { useTranslation } from 'react-i18next';

export default function Onboarding() {
    const navigate = useNavigate();
    const { t } = useTranslation('app');
    const { user } = useUser();
    const createNotebook = useCreateNotebook();

    const STEPS = [
        t('onboarding.step_register'),
        t('onboarding.step_profile'),
        t('onboarding.step_notebook'),
    ];

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError(t('onboarding.error_name'));
            return;
        }
        try {
            const notebook = await createNotebook.mutateAsync({
                name: name.trim(),
                description: description.trim(),
                folder_id: null,
            });
            navigate(`/workspaces/notebook/${notebook.id}`);
        } catch {
            // error handled in hook
        }
    };

    return (
        <AuthLayout title="Onboarding" description={t('onboarding.subtitle')}>
            {/* Decorative cylinders (same as login) */}
            <div className="cylinder1" />
            <div className="cylinder2" />
            <div className="cylinder3" />
            <div className="cylinder4" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-xl"
            >
                <div className="rounded-2xl bg-white/50 dark:bg-white/5 bg-clip-padding backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">

                    {/* Step indicators */}
                    <div className="mb-7 flex items-start justify-center gap-0">
                        {STEPS.map((step, i) => {
                            const done = i < 2;
                            const active = i === 2;
                            return (
                                <div key={step} className="flex items-start">
                                    <div className="flex flex-col items-center">
                                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                            done
                                                ? 'bg-[var(--primary-color)] text-white'
                                                : active
                                                ? 'bg-[var(--primary-color)] text-white ring-4 ring-blue-100 dark:ring-blue-500/20'
                                                : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                                        </div>
                                        <span className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                                            active ? 'text-[var(--primary-color)]' : 'text-gray-400 dark:text-gray-500'
                                        }`}>{step}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`mx-3 mt-3.5 h-px w-14 sm:w-20 shrink-0 ${
                                            i < 1 ? 'bg-[var(--primary-color)]' : 'bg-gray-200 dark:bg-white/10'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {user?.first_name ? t('onboarding.welcome', { name: user.first_name }) : t('onboarding.welcome', { name: '' }).trim()}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {t('onboarding.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('onboarding.name_label')}
                            </label>
                            <Input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setError(''); }}
                                placeholder={t('onboarding.name_placeholder')}
                                autoFocus
                                className="form-input block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)] sm:text-sm"
                            />
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('onboarding.desc_label')} <span className="font-normal text-gray-400">{t('onboarding.desc_optional')}</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder={t('onboarding.desc_placeholder')}
                                rows={2}
                                className="block w-full appearance-none resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm placeholder-gray-400 shadow-sm outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            variant={createNotebook.isPending ? 'outline' : 'default'}
                            disabled={createNotebook.isPending || !name.trim()}
                            className="w-full h-11 text-sm font-semibold"
                        >
                            {createNotebook.isPending ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 size={15} className="animate-spin" />
                                    {t('onboarding.creating')}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    {t('onboarding.submit')}
                                    <ArrowRight size={15} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="mt-4 w-full text-center text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {t('onboarding.skip')}
                    </button>
                </div>
            </motion.div>
        </AuthLayout>
    );
}
