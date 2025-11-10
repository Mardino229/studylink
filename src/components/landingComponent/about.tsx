import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <section className="py-20 sm:py-24 bg-background border-t border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            À propos de StudyLink
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="mt-4 text-foreground/70 text-lg"
          >
            Nous aidons les étudiants à apprendre plus efficacement grâce à des outils intelligents: résumés automatiques,
            flashcards, génération d’épreuves et assistant IA. Votre progression est au cœur de notre mission.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="mt-8"
          >
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full h-12 px-6 bg-foreground text-background text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              En savoir plus
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
            <h3 className="text-xl font-semibold text-foreground mb-2">Notre mission</h3>
            <p className="text-sm text-foreground/70">
              Rendre l’apprentissage accessible, personnalisé et mesurable pour chaque étudiant.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="p-6 rounded-xl border border-border bg-card shadow-sm"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">Notre approche</h3>
            <p className="text-sm text-foreground/70">
              Combiner IA et bonnes pratiques pédagogiques: synthèse, révision active, évaluation et feedback.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="p-6 rounded-xl border border-border bg-card shadow-sm"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">Nos valeurs</h3>
            <p className="text-sm text-foreground/70">
              Simplicité, éthique, respect des données, et impact positif sur vos résultats.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
