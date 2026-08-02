import type enCommon  from '../locales/en/common.json';
import type enAuth    from '../locales/en/auth.json';
import type enLanding from '../locales/en/landing.json';
import type enErrors  from '../locales/en/errors.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            common:  typeof enCommon;
            auth:    typeof enAuth;
            landing: typeof enLanding;
            errors:  typeof enErrors;
        };
    }
}
