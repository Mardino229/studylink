import { Link } from 'react-router-dom';
import type { ReactNode, MouseEventHandler } from 'react';

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

interface AppLinkProps {
    to: string;
    children: ReactNode;
    className?: string;
    onClick?: MouseEventHandler;
}

export function AppLink({ to, children, className, onClick }: AppLinkProps) {
    if (APP_DOMAIN) {
        return (
            <a
                href={`https://${APP_DOMAIN}${to}`}
                target="_blank"
                rel="noreferrer"
                className={className}
                onClick={onClick}
            >
                {children}
            </a>
        );
    }
    return (
        <Link to={to} className={className} onClick={onClick as () => void}>
            {children}
        </Link>
    );
}
