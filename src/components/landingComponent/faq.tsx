const FAQS = [
    {
        q: "Que permet StudyLink ?",
        a: "StudyLink centralise vos outils d'étude : génération de résumés, flashcards et quiz à partir de vos fichiers ou de vidéos YouTube, bibliothèque d'examens avec corrigés, chat, podcasts audio et statistiques de progression. Tout part d'une source   un PDF, un PPTX ou un lien YouTube   et StudyLink s'occupe du reste.",
        open: true,
    },
    {
        q: "Puis-je utiliser une vidéo YouTube comme source ?",
        a: "Oui. Collez l'URL d'une vidéo YouTube publique (youtube.com/watch, youtu.be ou youtube.com/shorts) dans votre workspace : Notre app extrait le contenu et l'indexe comme n'importe quelle source. Générez ensuite résumé, flashcards et quiz à partir de la vidéo. Les vidéos privées ou non listées ne sont pas supportées, et la durée maximale est d'environ 1 heure.",
    },
    {
        q: "Comment fonctionne le système de jetons ?",
        a: "Chaque fonctionnalité consomme des jetons : 1 jeton pour générer un résumé, des flashcards ou un quiz, 1 jeton par tranche de 10 messages de chat, et 2 jetons pour accéder à un corrigé payant. Vous achetez un pack de jetons (Starter, Standard ou Maxi) et les utilisez à votre rythme   sans date d'expiration.",
    },
    {
        q: "Quelle est la différence entre l'abonnement Pro et les packs de jetons ?",
        a: "Avec les packs de jetons, vous payez à la consommation. L'abonnement Pro donne un accès illimité à toutes les fonctionnalités, sans jamais déduire de jetons. Pro est idéal si vous générez beaucoup de contenu chaque mois.",
    },
    {
        q: "Les corrigés sont-ils tous payants ?",
        a: "Non. Certains corrigés sont gratuits et accessibles sans jeton. Les corrigés marqués \"payants\" nécessitent soit 2 jetons, soit un abonnement Pro actif. Le téléchargement des épreuves (sans corrigé) est toujours gratuit.",
    },
    {
        q: "Mes anciens résumés et artefacts disparaissent-ils si je n'ai plus de jetons ?",
        a: "Non. Les artefacts déjà générés (résumés, flashcards, quiz) restent accessibles indéfiniment, même si votre solde de jetons tombe à zéro ou si votre abonnement Pro expire.",
    },
    {
        q: "Puis-je utiliser StudyLink sur mobile ?",
        a: "Oui. L'interface est responsive et pensée pour s'adapter aux petits écrans   que ce soit sur la landing ou dans l'application elle-même.",
    },
];

export default function Faq() {
    return (
        <section className="py-12 sm:py-28 bg-muted" id="faq">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Questions fréquentes</h2>
                    <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
                        Tout ce que vous devez savoir sur StudyLink, les jetons et les abonnements.
                    </p>
                </div>
                <div className="mt-16 max-w-4xl mx-auto space-y-4">
                    {FAQS.map(({ q, a, open }) => (
                        <details key={q} className="group border-b border-border pb-4" open={open}>
                            <summary className="flex cursor-pointer items-center justify-between gap-4">
                                <h3 className="text-lg font-semibold text-foreground">{q}</h3>
                                <svg
                                    className="size-6 shrink-0 text-foreground/60 transition-transform duration-300 group-open:rotate-180"
                                    fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2" viewBox="0 0 24 24"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-foreground/70 leading-relaxed">{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
