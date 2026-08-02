import React from 'react';
import { Loader2, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from './modal/index.tsx';
import { useGetTokenPacks, useBuyTokenPack } from '../../utils/billing';
import { useTranslation } from 'react-i18next';

type UpgradeModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { data: packs = [], isLoading } = useGetTokenPacks();
    const buyPack = useBuyTokenPack();
    const { t } = useTranslation('app');

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                    <Zap size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('upgrade_modal.title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('upgrade_modal.recharge_desc')}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="mb-5 space-y-2.5">
                    {packs.map((pack, i) => (
                        <div
                            key={pack.id}
                            className={`relative flex items-center justify-between rounded-xl border p-4 ${
                                i === 1
                                    ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                    : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/60'
                            }`}
                        >
                            {i === 1 && (
                                <span className="absolute -top-2.5 left-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                    {t('upgrade_modal.recommended')}
                                </span>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{pack.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">🪙 {pack.tokens} {t('upgrade_modal.tokens_unit')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{pack.price_cad} $</span>
                                <button
                                    onClick={() => buyPack.mutate(pack.id)}
                                    disabled={buyPack.isPending}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {buyPack.isPending ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        t('upgrade_modal.buy_btn')
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                    <Sparkles size={15} className="text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('upgrade_modal.go_pro')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('upgrade_modal.pro_desc')}</p>
                </div>
                <Link
                    to="/subscription"
                    onClick={onClose}
                    className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                    {t('upgrade_modal.view_plans')}
                </Link>
            </div>
        </Modal>
    );
}
