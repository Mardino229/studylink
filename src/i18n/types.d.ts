import type enCommon    from '../locales/en/common.json';
import type enAuth      from '../locales/en/auth.json';
import type enLanding   from '../locales/en/landing.json';
import type enErrors    from '../locales/en/errors.json';
import type enApp       from '../locales/en/app.json';
import type enWorkspace from '../locales/en/workspace.json';
import type enExams     from '../locales/en/exams.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            common:    typeof enCommon;
            auth:      typeof enAuth;
            landing:   typeof enLanding;
            errors:    typeof enErrors;
            app:       typeof enApp;
            workspace: typeof enWorkspace;
            exams:     typeof enExams;
        };
    }
}
