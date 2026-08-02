import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LANDING_DOMAIN = import.meta.env.VITE_LANDING_DOMAIN;
const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

const LANDING_ROUTES = new Set(['/', '/about', '/privacy', '/terms']);

export function DomainRedirect() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        if (!LANDING_DOMAIN || !APP_DOMAIN) return;

        const host = window.location.hostname;
        const isLandingRoute = LANDING_ROUTES.has(pathname);

        if (host === LANDING_DOMAIN && !isLandingRoute) {
            window.location.replace(`https://${APP_DOMAIN}${pathname}${search}`);
        } else if (host === APP_DOMAIN && isLandingRoute) {
            window.location.replace(`https://${LANDING_DOMAIN}${pathname}${search}`);
        }
    }, [pathname, search]);

    return null;
}
