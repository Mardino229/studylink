import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation('landing');

  return (
    <section className="py-20 sm:py-24 bg-background border-t border-border/60">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            {t('about_page.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="mt-4 text-foreground/70 text-lg"
          >
            {t('about_page.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="mt-8"
          >
            <Link
              to="/#key-features"
              className="inline-flex items-center justify-center rounded-full h-12 px-6 bg-foreground text-background text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              {t('about_page.cta')}
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-6 rounded-xl border border-border bg-card shadow-sm"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('about_page.mission_title')}</h3>
            <p className="text-sm text-foreground/70">{t('about_page.mission_text')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="p-6 rounded-xl border border-border bg-card shadow-sm"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('about_page.approach_title')}</h3>
            <p className="text-sm text-foreground/70">{t('about_page.approach_text')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="p-6 rounded-xl border border-border bg-card shadow-sm"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('about_page.values_title')}</h3>
            <p className="text-sm text-foreground/70">{t('about_page.values_text')}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
