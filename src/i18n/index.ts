import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon  from '../locales/en/common.json';
import enAuth    from '../locales/en/auth.json';
import enLanding from '../locales/en/landing.json';
import enErrors  from '../locales/en/errors.json';
import frCommon  from '../locales/fr/common.json';
import frAuth    from '../locales/fr/auth.json';
import frLanding from '../locales/fr/landing.json';
import frErrors  from '../locales/fr/errors.json';

const savedLang = localStorage.getItem('lang');
const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en';

i18n.use(initReactI18next).init({
    resources: {
        en: { common: enCommon, auth: enAuth, landing: enLanding, errors: enErrors },
        fr: { common: frCommon, auth: frAuth, landing: frLanding, errors: frErrors },
    },
    lng: savedLang ?? browserLang,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
});

export default i18n;
