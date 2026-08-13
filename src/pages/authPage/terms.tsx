import Header from "../../components/landingComponent/header.tsx";
import Footer from "../../components/landingComponent/footer.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { useTranslation } from "react-i18next";

export default function Terms() {
    const { t } = useTranslation('legal');

    return (
        <>
            <PageMeta
                title={t('terms.meta_title')}
                description={t('terms.meta_desc')}
            />
            <div className="relative flex min-h-screen flex-col bg-muted dark:bg-background">
                <div className="layout-container flex h-full grow flex-col">
                    <Header />
                    <main className="flex-1">
                        <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                            <div className="mb-12">
                                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    {t('terms.badge')}
                                </p>
                                <h1 className="sm:text-4xl text-3xl font-bold tracking-tight text-foreground">
                                    {t('terms.title')}
                                </h1>
                                <p className="mt-3 text-foreground/60">
                                    {t('terms.last_updated')}
                                </p>
                            </div>

                            <div className="space-y-10 text-foreground/80 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-foreground/75 [&_li]:list-disc [&_li]:leading-relaxed">

                                <p>{t('terms.intro')}</p>

                                <section>
                                    <h2>{t('terms.s1_title')}</h2>
                                    <p>{t('terms.s1_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s2_title')}</h2>
                                    <ul>
                                        <li>{t('terms.s2_item1')}</li>
                                        <li>{t('terms.s2_item2')}</li>
                                        <li>{t('terms.s2_item3')}</li>
                                        <li>{t('terms.s2_item4')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>{t('terms.s3_title')}</h2>
                                    <p>{t('terms.s3_intro')}</p>
                                    <ul>
                                        <li>{t('terms.s3_item1')}</li>
                                        <li>{t('terms.s3_item2')}</li>
                                        <li>{t('terms.s3_item3')}</li>
                                        <li>{t('terms.s3_item4')}</li>
                                        <li>{t('terms.s3_item5')}</li>
                                        <li>{t('terms.s3_item6')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>{t('terms.s4_title')}</h2>
                                    <p>{t('terms.s4_text1')}</p>
                                    <p className="mt-3">{t('terms.s4_text2')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s5_title')}</h2>
                                    <p>{t('terms.s5_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s6_title')}</h2>
                                    <ul>
                                        <li><strong>{t('terms.s6_item1_label')}</strong>{' '}{t('terms.s6_item1')}</li>
                                        <li><strong>{t('terms.s6_item2_label')}</strong>{' '}{t('terms.s6_item2')}</li>
                                        <li><strong>{t('terms.s6_item3_label')}</strong>{' '}{t('terms.s6_item3')}</li>
                                        <li>{t('terms.s6_item4')}</li>
                                        <li>{t('terms.s6_item5')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>{t('terms.s7_title')}</h2>
                                    <p>{t('terms.s7_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s8_title')}</h2>
                                    <p>{t('terms.s8_text1')}</p>
                                    <p className="mt-3">{t('terms.s8_text2')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s9_title')}</h2>
                                    <p>{t('terms.s9_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s10_title')}</h2>
                                    <p>{t('terms.s10_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s11_title')}</h2>
                                    <p>{t('terms.s11_text')}</p>
                                </section>

                                <section>
                                    <h2>{t('terms.s12_title')}</h2>
                                    <p>{t('terms.s12_text')}</p>
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
