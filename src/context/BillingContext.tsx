import React, { createContext, useContext } from 'react';
import { useGetMyActiveSubscription } from '../utils/subscription';
import { useGetTokenBalance } from '../utils/billing';
import type { Subscription } from '../utils/type';

type BillingContextType = {
    isPro: boolean;
    isUltra: boolean;
    tokenBalance: number;
    subscription: Subscription | null;
    refetchBilling: () => void;
    isLoading: boolean;
};

const BillingContext = createContext<BillingContextType>({
    isPro: false,
    isUltra: false,
    tokenBalance: 0,
    subscription: null,
    refetchBilling: () => {},
    isLoading: true,
});

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: subscription, isLoading: isLoadingSub, refetch: refetchSub } = useGetMyActiveSubscription();
    const { data: tokenData, isLoading: isLoadingBalance, refetch: refetchBalance } = useGetTokenBalance();

    const isPro = subscription?.status === 'active' && (subscription?.plan?.includes_audio === false);
    const isUltra = subscription?.status === 'active' && (subscription?.plan?.includes_audio === true);
    
    
    const tokenBalance = tokenData?.balance ?? 0;

    const refetchBilling = () => {
        void refetchSub();
        void refetchBalance();
    };

    return (
        <BillingContext.Provider value={{
            isPro,
            isUltra,
            tokenBalance,
            subscription: subscription ?? null,
            refetchBilling,
            isLoading: isLoadingSub || isLoadingBalance,
        }}>
            {children}
        </BillingContext.Provider>
    );
};

export const useBilling = () => useContext(BillingContext);
