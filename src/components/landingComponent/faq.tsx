const FAQS = [
    {
        q: "Que permet GoStudyEasy ?",
        a: "GoStudyEasy génère l'ensemble de tes outils d'étude et de révision à partir des contenus que tu lui fournis : résumés, flashcards et quiz à partir de tes fichiers ou de vidéos YouTube. Tu disposes aussi d'une bibliothèque d'épreuves dont certaines sont corrigées, d'un assistant de révision, de podcasts audio et d'outils de suivi de ta progression.",
        open: true,
    },
    {
        q: "Puis-je utiliser une vidéo YouTube comme source ?",
        a: "Oui. Colle l'URL d'une vidéo YouTube publique dans l'espace dédié de ton espace de travail. GoStudyEasy en extrait le contenu et le rend disponible comme n'importe quelle autre source. Génère ensuite des résumés, des flashcards et des quiz à partir de la vidéo. Les vidéos privées ou non listées ne sont pas prises en charge, et la durée maximale est d'environ 1 heure.",
    },
    {
        q: "Comment fonctionne le système de jetons ?",
        a: "Si tu ne disposes pas d'un abonnement, chaque fonctionnalité consomme des jetons : 1 jeton pour générer un résumé, des flashcards ou un quiz, 1 jeton par tranche de 10 messages de chat, 1 jeton pour accéder à une épreuve et 2 jetons pour accéder à un corrigé payant. Tu achètes un pack de jetons (Starter, Standard ou Maxi) et tu les utilises à ton rythme, sans date d'expiration pour les jetons.",
    },
    {
        q: "Quelle est la différence entre l'abonnement Pro et les packs de jetons ?",
        a: "Avec les packs de jetons, vous payez à la consommation. L'abonnement Pro donne un accès illimité à toutes les fonctionnalités, sans jamais déduire de jetons pendant toute la durée de l'abonnement. Pro est idéal si vous générez beaucoup de contenu chaque mois.",
    },
    {
        q: "Les épreuves et corrigés sont-ils tous payants ?",
        a: "Oui. L'accès à une épreuve nécessite 1 jeton, et l'accès à son corrigé nécessite 2 jetons, sauf avec un abonnement Pro ou Ultra actif qui donne un accès illimité aux deux.",
    },
    {
        q: "Mes anciens résumés et générations disparaissent-ils si je n'ai plus de jetons ?",
        a: "Non. Tes créations déjà générées (résumés, flashcards, quiz) restent accessibles indéfiniment, même si ton solde de jetons tombe à zéro ou si ton abonnement expire.",
    },
    {
        q: "Puis-je utiliser GoStudyEasy sur mobile ?",
        a: "Oui. Le site et l'application s'adaptent automatiquement à ton téléphone, pour une expérience aussi fluide que sur ordinateur.",
    },
];

export default function Faq() {
    return (
        <section className="py-12 sm:py-28 bg-muted" id="faq">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Questions fréquentes</h2>
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
