import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../../lib/analytics';

export const AnalyticsTracker = (): null => {
    const location = useLocation();

    useEffect(() => {
        initGA();
    }, []);

    useEffect(() => {
        const fullPath = location.pathname + location.search;
        trackPageView(fullPath);
    }, [location.pathname, location.search]);

    return null;
};
