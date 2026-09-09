import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, ArrowRight, Volume2, Mic, AlertCircle } from 'lucide-react';
import { Modal } from './modal/index.tsx';
import { useBilling } from '../../context/BillingContext.tsx';

export interface AudioFeatureChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmUseTokens: () => void;
    onOpenRecharge: () => void;
    featureType?: 'audio' | 'podcast';
    cost?: number;
}

export const AudioFeatureChoiceModal: React.FC<AudioFeatureChoiceModalProps> = ({
    isOpen,
    onClose,
    onConfirmUseTokens,
    onOpenRecharge,
    featureType = 'audio',
    cost = 5,
}) => {
    const { t } = useTranslation('workspace');
    const navigate = useNavigate();
    const { tokenBalance } = useBilling();

    const hasEnoughTokens = tokenBalance >= cost;

    const handleUseTokens = () => {
        onClose();
        if (hasEnoughTokens) {
            onConfirmUseTokens();
        } else {
            onOpenRecharge();
        }
    };

    const handleUpgradeUltra = () => {
        onClose();
        navigate('/subscription');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-sm">
                        {featureType === 'podcast' ? <Mic size={22} /> : <Volume2 size={22} />}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {featureType === 'podcast'
                                ? t('audio_choice_modal.title_podcast')
                                : t('audio_choice_modal.title_audio')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('audio_choice_modal.subtitle')}
                        </p>
                    </div>
                </div>

                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {t('audio_choice_modal.choose_hint')}
                </p>

                {/* Choices */}
                <div className="flex flex-col gap-3">
                    {/* Option Ultra */}
                    <div
                        onClick={handleUpgradeUltra}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleUpgradeUltra();
                        }}
                        className="group relative flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border-2 border-purple-400/60 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 p-4 transition-all hover:border-purple-500 hover:shadow-md dark:border-purple-600/40 dark:from-purple-950/20 dark:via-gray-900 dark:to-indigo-950/20 sm:flex-row sm:items-center"
                    >
                        <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                            {t('audio_choice_modal.ultra_card_badge')}
                        </span>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                                <Sparkles size={18} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {t('audio_choice_modal.ultra_card_title')}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('audio_choice_modal.ultra_card_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="self-end sm:self-center">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-transform group-hover:scale-105 group-hover:bg-purple-700">
                                {t('audio_choice_modal.ultra_card_btn')}
                                <ArrowRight size={13} />
                            </span>
                        </div>
                    </div>

                    {/* Option Tokens */}
                    <div
                        onClick={handleUseTokens}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleUseTokens();
                        }}
                        className={`group relative flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-4 transition-all hover:shadow-md sm:flex-row sm:items-center ${
                            hasEnoughTokens
                                ? 'border-gray-200 bg-white hover:border-amber-400 dark:border-gray-800 dark:bg-gray-900'
                                : 'border-amber-200 bg-amber-50/40 hover:border-amber-400 dark:border-amber-900/40 dark:bg-amber-950/10'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                                <Zap size={18} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {t('audio_choice_modal.tokens_card_title')}
                                    </h4>
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                        {t('audio_choice_modal.tokens_cost')}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {hasEnoughTokens
                                        ? `${tokenBalance > 1 ? t('audio_choice_modal.tokens_balance_plural', { count: tokenBalance }) : t('audio_choice_modal.tokens_balance', { count: tokenBalance })} • ${t('audio_choice_modal.tokens_remaining', { count: tokenBalance - cost })}`
                                        : (
                                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                                                <AlertCircle size={12} />
                                                {t('audio_choice_modal.tokens_insufficient', { count: tokenBalance })}
                                            </span>
                                        )}
                                </p>
                            </div>
                        </div>

                        <div className="self-end sm:self-center">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition-transform group-hover:scale-105 ${
                                    hasEnoughTokens
                                        ? 'bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                                        : 'bg-amber-500 text-white hover:bg-amber-600'
                                }`}
                            >
                                <Zap size={13} />
                                {hasEnoughTokens
                                    ? t('audio_choice_modal.tokens_card_btn')
                                    : t('audio_choice_modal.tokens_card_btn_recharge')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-1 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                        {t('audio_choice_modal.cancel')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AudioFeatureChoiceModal;

