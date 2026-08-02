import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
    const { i18n } = useTranslation();
    const isFr = i18n.language.startsWith('fr');

    const toggle = () => {
        const next = isFr ? 'en' : 'fr';
        i18n.changeLanguage(next);
        localStorage.setItem('lang', next);
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Switch language"
            className={`inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors ${className}`}
        >
            <Languages size={14} />
            {isFr ? 'EN' : 'FR'}
        </button>
    );
}
