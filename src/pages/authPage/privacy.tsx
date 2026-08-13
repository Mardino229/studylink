import Header from "../../components/landingComponent/header.tsx";
import Footer from "../../components/landingComponent/footer.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { useTranslation } from "react-i18next";

export default function Privacy() {
    const { t } = useTranslation('legal');

    return (
        <>
            <PageMeta
                title={t('privacy.meta_title')}
                description={t('privacy.meta_desc')}
            />
            <div className="relative flex min-h-screen flex-col bg-muted dark:bg-background">
                <div className="layout-container flex h-full grow flex-col">
                    <Header />
                    <main className="flex-1">
                        <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                            <div className="mb-12">
                                <p className="mb-2 text-xs text-center font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    {t('privacy.badge')}
                                </p>
                                <h1 className="sm:text-4xl text-3xl font-bold tracking-tight text-foreground">
                                    {t('privacy.title')}
                                </h1>
                                <p className="mt-3 text-foreground/60">
                                    {t('privacy.last_updated')}
                                </p>
                            </div>

                            <div className="space-y-10 text-foreground/80 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-foreground/75 [&_li]:list-disc [&_li]:leading-relaxed">

                                <p>{t('privacy.intro')}</p>

                                <section>
                                    <h2>{t('privacy.s1_title')}</h2>
                                    <p>{t('privacy.s1_intro')}</p>
                                    <ul>
                                        <li><strong>{t('privacy.s1_item1_label')}</strong>{' '}{t('privacy.s1_item1')}</li>
                                        <li><strong>{t('privacy.s1_item2_label')}</strong>{' '}{t('privacy.s1_item2')}</li>
                                        <li><strong>{t('privacy.s1_item3_label')}</strong>{' '}{t('privacy.s1_item3')}</li>
                                        <li><strong>{t('privacy.s1_item4_label')}</strong>{' '}{t('privacy.s1_item4')}</li>
                                        <li><strong>{t('privacy.s1_item5_label')}</strong>{' '}{t('privacy.s1_item5')}</li>
                                        <li><strong>{t('privacy.s1_item6_label')}</strong>{' '}{t('privacy.s1_item6')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>{t('privacy.s2_title')}</h2>
                                    <p>{t('privacy.s2_intro')}</p>
                                    <ul>
                                        <li>{t('privacy.s2_item1')}</li>
                                        <li>{t('privacy.s2_item2')}</li>
                                        <li>{t('privacy.s2_item3')}</li>
                                        <li>{t('privacy.s2_item4')}</li>
                                        <li>{t('privacy.s2_item5')}</li>
                                    </ul>
                                    <p className="mt-3">
                                        <strong>{t('privacy.s2_no_sell')}</strong>
                                    </p>
                                </section>

                                <section>
                                    <h2>{t('privacy.s3_title')}</h2>
                                    <p>{t('privacy.s3_intro')}</p>
                                    <ul>
                                        <li><strong>{t('privacy.s3_item1_label')}</strong>{' '}{t('privacy.s3_item1')}</li>
                                        <li><strong>{t('privacy.s3_item2_label')}</strong>{' '}{t('privacy.s3_item2')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>{t('privacy.s4_title')}</h2>
                                    <p>{t('privacy.s4_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('privacy.s5_title')}</h2>
                                    <p>{t('privacy.s5_intro')}</p>
                                    <ul>
                                        <li>{t('privacy.s5_item1')}</li>
                                        <li>{t('privacy.s5_item2')}</li>
                                        <li>{t('privacy.s5_item3')}</li>
                                        <li>{t('privacy.s5_item4')}</li>
                                    </ul>
                                    <p className="mt-3">
                                        {t('privacy.s5_contact')}{' '}
                                        <a
                                            href="mailto: contact@bluecurvespace.com "
                                            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                                        >
                                            contact@bluecurvespace.com
                                        </a>
                                        .
                                    </p>
                                </section>

                                <section>
                                    <h2>{t('privacy.s6_title')}</h2>
                                    <p>{t('privacy.s6_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('privacy.s7_title')}</h2>
                                    <p>{t('privacy.s7_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('privacy.s8_title')}</h2>
                                    <p>{t('privacy.s8_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('privacy.s9_title')}</h2>
                                    <p>{t('privacy.s9_text')}</p>
                                    <p className="mt-2">
                                        <strong>BlueCurve</strong>
                                        <br />
                                        <a
                                            href="mailto:contact@bluecurvespace.com"
                                            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                                        >
                                            contact@bluecurvespace.com
                                        </a>
                                    </p>
                                </section>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
