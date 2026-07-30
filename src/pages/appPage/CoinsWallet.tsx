import { ArrowRight, Coins, Loader2, TrendingUp, Zap } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useGetCoinBalance, useGetCoinTransactions, useConvertCoins } from '../../utils/coins';
import type { CoinTransaction } from '../../types/exams';

const CONVERT_THRESHOLD = 5;

export default function CoinsWallet() {
    const { data: balanceData, isLoading: loadingBalance } = useGetCoinBalance();
    const { data: transactions = [], isLoading: loadingTx } = useGetCoinTransactions();
    const convertCoins = useConvertCoins();

    const coinBalance = balanceData?.coin_balance ?? 0;
    const canConvert = coinBalance >= CONVERT_THRESHOLD;

    return (
        <>
            <PageMeta title="Wallet de coins" description="Vos coins de contribution et leur conversion en jetons" />
            <PageBreadcrumb pageTitle="Wallet" />

            <div className="space-y-6">
                {/* Balance card */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-900/30 dark:from-amber-900/20 dark:to-orange-900/10">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl dark:bg-amber-500/10" />
                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                            Solde coins
                        </p>
                        {loadingBalance ? (
                            <div className="h-10 w-24 animate-pulse rounded-xl bg-amber-200/50 dark:bg-amber-800/30" />
                        ) : (
                            <p className="text-4xl font-black text-amber-900 dark:text-amber-100">
                                {coinBalance.toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                <span className="ml-2 text-base font-semibold text-amber-700 dark:text-amber-300">coins</span>
                            </p>
                        )}
                        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                            Gagnés par vos soumissions validées par l'équipe BlueCurve.
                        </p>
                    </div>
                </div>

                {/* Conversion section */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/80">
                    <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Convertir en jetons</h2>
                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                        5 coins = 1 jeton. Les jetons servent à générer des artefacts et accéder aux corrigés.
                    </p>
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                            <Coins size={20} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">5 coins</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Déduire de votre solde</p>
                        </div>
                        <ArrowRight size={16} className="shrink-0 text-gray-400" />
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Zap size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">1 jeton</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Crédité sur votre compte</p>
                        </div>
                    </div>
                    <button
                        onClick={() => convertCoins.mutate()}
                        disabled={!canConvert || convertCoins.isPending}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {convertCoins.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Zap size={16} />
                        )}
                        {canConvert
                            ? `Convertir (solde : ${coinBalance.toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} coins)`
                            : `Solde insuffisant   il faut ${CONVERT_THRESHOLD} coins`}
                    </button>
                </div>

                {/* Transaction history */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/80">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Historique</h2>
                        <TrendingUp size={16} className="text-gray-400" />
                    </div>
                    {loadingTx ? (
                        <div className="space-y-3 p-5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Coins size={28} className="mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aucune transaction pour l'instant. Soumettez des épreuves !
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {transactions.map(tx => (
                                <TxRow key={tx.id} tx={tx} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function TxRow({ tx }: { tx: CoinTransaction }) {
    const isEarned = tx.type === 'earned';
    return (
        <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isEarned ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                    {isEarned
                        ? <Coins size={15} className="text-emerald-600 dark:text-emerald-400" />
                        : <Zap size={15} className="text-blue-600 dark:text-blue-400" />
                    }
                </div>
                <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                        {tx.description ?? (isEarned ? 'Soumission validée' : 'Conversion en jeton')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${
                isEarned ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
                {isEarned ? '+' : '−'}{Math.abs(tx.amount).toFixed(1)}
            </span>
        </div>
    );
}
