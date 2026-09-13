import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;

/**
 * Initializes Google Analytics 4 if VITE_GA_MEASUREMENT_ID is configured.
 */
export const initGA = (): boolean => {
    if (isInitialized) return true;

    if (GA_MEASUREMENT_ID) {
        ReactGA.initialize(GA_MEASUREMENT_ID);
        isInitialized = true;
        if (import.meta.env.DEV) {
            console.log(`[GA4] Initialized with Measurement ID: ${GA_MEASUREMENT_ID}`);
        }
        return true;
    } else {
        if (import.meta.env.DEV) {
            console.warn('[GA4] VITE_GA_MEASUREMENT_ID is not defined. GA4 tracking is disabled.');
        }
        return false;
    }
};

/**
 * Sends a pageview event to GA4.
 */
export const trackPageView = (path: string, title?: string): void => {
    if (!isInitialized) {
        const initialized = initGA();
        if (!initialized) return;
    }

    ReactGA.send({
        hitType: 'pageview',
        page: path,
        title: title || document.title,
    });
};

/**
 * Tracks a custom event in GA4.
 */
export const trackEvent = (
    category: string,
    action: string,
    label?: string,
    value?: number
): void => {
    if (!isInitialized) {
        const initialized = initGA();
        if (!initialized) return;
    }

    ReactGA.event({
        category,
        action,
        label,
        value,
    });
};

/**
 * Associates a user ID with the GA session.
 */
export const setGAUserId = (userId: string | null): void => {
    if (!isInitialized) {
        const initialized = initGA();
        if (!initialized) return;
    }

    if (userId) {
        ReactGA.set({ userId });
    }
};
