import { motion } from "framer-motion";

export default function AboutFeatures() {
  return (
    <section className="py-20 sm:py-28 bg-background" id="key-features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro (About) */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            À propos de StudyLink
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            viewport={{ once: true, amount: 0.6 }}
            className="mt-4 text-lg text-foreground/70"
          >
            Nous aidons les étudiants à apprendre plus efficacement grâce à des outils intelligents: résumés automatiques,
            flashcards, génération d’épreuves et assistant IA. Votre progression est au cœur de notre mission.
          </motion.p>
        </div>

        {/* Key Features grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.12 } },
          }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Card 1 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-start text-left gap-4 p-8 bg-card rounded-2xl shadow-lg border border-border"
          >
            <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-500">
              <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M208,24H88a16,16,0,0,0-16,16V88a16,16,0,0,0,16,16h32v80a8,8,0,0,0,16,0V104h8a16,16,0,0,0,16-16V40A16,16,0,0,0,208,24Zm0,64H88V40h16v8a8,8,0,0,0,16,0V40h72ZM64,184H48V56a8,8,0,0,0-16,0v128H16a8,8,0,0,0-8,8v16a8,8,0,0,0,8,8H64a8,8,0,0,0,8-8V192A8,8,0,0,0,64,184Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground">Summaries & Flashcards</h3>
            <p className="text-foreground/70">Générez des résumés concis et des flashcards interactives à partir de vos contenus.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-start text-left gap-4 p-8 bg-card rounded-2xl shadow-lg border border-border"
          >
            <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-purple-100 to-orange-100 text-purple-500">
              <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm41.44,142.56a8,8,0,0,1-11.31,0L133,141.44,107.88,166.56a8,8,0,0,1-11.32-11.32L121.69,128,96.56,102.76a8,8,0,0,1,11.32-11.32L133,116.56l25.13-25.12a8,8,0,0,1,11.31,11.31L144.31,128l25.13,25.13A8,8,0,0,1,169.44,166.56Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground">Assistant IA</h3>
            <p className="text-foreground/70">Obtenez de l'aide 24/7 pour comprendre, résoudre et progresser.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-start text-left gap-4 p-8 bg-card rounded-2xl shadow-lg border border-border"
          >
            <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 text-orange-500">
              <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M218.3,98.3,158,38,97.7,98.3a12,12,0,0,0,8.5,20.5H124v22.84C108.57,146.43,84.4,166.6,80,172a12,12,0,0,0-4,9.27V216a12,12,0,0,0,12,12H168a12,12,0,0,0,12-12V181.27a12,12,0,0,0-4-9.27c-4.4-5.4-28.57-25.57-44-30.39V118.8h17.8a12,12,0,0,0,8.5-20.5ZM164,204H92v-16.73c2-1.89,20.25-18.17,36-22.11,15.84,3.94,34,20.22,36,22.11ZM109.2,106.8l26.5-26.5,26.5,26.5H109.2Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground">Générateur d’épreuves</h3>
            <p className="text-foreground/70">Créez des examens personnalisés pour tester vos connaissances.</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-start text-left gap-4 p-8 bg-card rounded-2xl shadow-lg border border-border"
          >
            <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 text-blue-600">
              <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M104,104a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm48-16a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V88A8,8,0,0,0,152,88Zm-84,48H48a8,8,0,0,0,0,16H68Zm-4,40a8,8,0,0,0-8-8H48a8,8,0,0,0,0,16H56A8,8,0,0,0,64,168Zm124-40h-4a8,8,0,0,0,0,16h4Zm-4,32a8,8,0,0,0-8,8v4a8,8,0,0,0,16,0v-4A8,8,0,0,0,184,160ZM232,88v24a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0ZM40,112a8,8,0,0,0-8-8H8a8,8,0,0,0,0,16H32A8,8,0,0,0,40,112ZM192,56a8,8,0,0,0,8,8h24a8,8,0,0,0,0-16H200A8,8,0,0,0,192,56ZM56,56a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V48A8,8,0,0,0,56,56Zm144,144h-8a8,8,0,0,0,0,16h8Zm-48-8a8,8,0,0,0,8,8h4a8,8,0,0,0,0-16h-4A8,8,0,0,0,152,192Zm-24,40a8,8,0,0,0,8-8v-8a8,8,0,0,0-16,0v8A8,8,0,0,0,128,232Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground">Apprentissage collaboratif</h3>
            <p className="text-foreground/70">Collaborez sur des documents et guides d’étude en temps réel.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
