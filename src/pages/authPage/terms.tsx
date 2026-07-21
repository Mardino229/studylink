import Header from "../../components/landingComponent/header.tsx";
import Footer from "../../components/landingComponent/footer.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";

const LAST_UPDATED = "20 juillet 2026";

export default function Terms() {
    return (
        <>
            <PageMeta
                title="Conditions d'utilisation • GoStudyEasy"
                description="Les conditions régissant l'utilisation de la plateforme GoStudyEasy."
            />
            <div className="relative flex min-h-screen flex-col bg-muted dark:bg-background">
                <div className="layout-container flex h-full grow flex-col">
                    <Header />
                    <main className="flex-1">
                        <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                            {/* Header */}
                            <div className="mb-12">
                                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    Légal
                                </p>
                                <h1 className="sm:text-4xl text-3xl font-bold tracking-tight text-foreground">
                                    Conditions d'utilisation
                                </h1>
                                <p className="mt-3 text-foreground/60">
                                    Dernière mise à jour : {LAST_UPDATED}
                                </p>
                            </div>

                            <div className="space-y-10 text-foreground/80 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-foreground/75 [&_li]:list-disc [&_li]:leading-relaxed">

                                <p>
                                    Les présentes conditions d'utilisation (<strong>"Conditions"</strong>) régissent votre
                                    accès à la plateforme GoStudyEasy et son utilisation. En créant un compte ou en utilisant
                                    le service, vous acceptez ces Conditions dans leur intégralité.
                                </p>

                                <section>
                                    <h2>1. Description du service</h2>
                                    <p>
                                        GoStudyEasy est une plateforme d'aide à la révision permettant aux étudiants de
                                        générer des résumés, des flashcards, des pistes audios explicatives et des quiz
                                        à partir de leurs documents, d'accéder à une bibliothèque d'épreuves, et
                                        d'interagir avec un assistant de révision. Le service est fourni tel quel et
                                        peut évoluer sans préavis.
                                    </p>
                                </section>

                                <section>
                                    <h2>2. Compte utilisateur</h2>
                                    <ul>
                                        <li>
                                            Vous êtes responsable de la confidentialité de vos identifiants et de toute
                                            activité réalisée depuis votre compte.
                                        </li>
                                        <li>
                                            Vous devez fournir des informations exactes lors de l'inscription.
                                        </li>
                                        <li>
                                            Un seul compte par personne est autorisé.
                                        </li>
                                        <li>
                                            Vous devez avoir au moins 13 ans pour créer un compte. Les utilisateurs entre
                                            13 et 16 ans doivent avoir obtenu le consentement d'un parent ou tuteur légal.
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>3. Utilisation acceptable</h2>
                                    <p>Vous vous engagez à ne pas :</p>
                                    <ul>
                                        <li>
                                            Utiliser le service à des fins illégales ou contraires aux présentes Conditions.
                                        </li>
                                        <li>
                                            Importer des contenus protégés par des droits d'auteur sans y avoir été autorisé,
                                            des contenus haineux, illicites ou portant atteinte à la vie privée de tiers.
                                        </li>
                                        <li>
                                            Tenter de contourner les mécanismes de sécurité ou d'accéder à des données
                                            appartenant à d'autres utilisateurs.
                                        </li>
                                        <li>
                                            Automatiser l'accès au service (scraping, bots) sans autorisation écrite.
                                        </li>
                                        <li>
                                            Revendre ou redistribuer l'accès au service à des tiers.
                                        </li>
                                        <li>
                                            Créer plusieurs comptes pour contourner les limitations du plan gratuit.
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>4. Contenu utilisateur</h2>
                                    <p>
                                        Vous conservez l'entière propriété des documents que vous importez. En les déposant
                                        sur GoStudyEasy, vous nous accordez une licence limitée, non exclusive et
                                        non transférable pour les traiter dans le seul but de vous fournir le service.
                                    </p>
                                    <p className="mt-3">
                                        Vous êtes seul responsable du contenu que vous importez et garantissez que vous
                                        disposez des droits nécessaires pour le partager avec le service.
                                    </p>
                                </section>

                                <section>
                                    <h2>5. Propriété intellectuelle</h2>
                                    <p>
                                        GoStudyEasy et tous ses composants (interface, marque, code, artefacts générés par la
                                        plateforme elle-même) sont la propriété exclusive de GoStudyEasy. Aucun élément ne
                                        peut être reproduit, copié ou distribué sans notre accord écrit préalable.
                                    </p>
                                </section>

                                <section>
                                    <h2>6. Jetons et paiements</h2>
                                    <ul>
                                        <li>
                                            <strong>Packs de jetons : </strong>   les jetons achetés n'ont pas de date
                                            d'expiration mais ne sont pas remboursables une fois achetés.
                                        </li>
                                        <li>
                                            <strong>Abonnement Pro : </strong>   l'abonnement est renouvelé automatiquement
                                            (mensuel ou annuel) et peut être annulé à tout moment depuis vos paramètres.
                                            Aucun remboursement n'est accordé pour la période en cours.
                                        </li>
                                        <li>
                                            <strong>Accès aux épreuves : </strong>   l'accès à une épreuve (1 jeton) ou à
                                            un corrigé (2 jetons) est permanent : une fois débloqué, il reste accessible
                                            indéfiniment, même après la fin d'un abonnement Pro.
                                        </li>
                                        <li>
                                            Tous les prix sont en dollars canadiens (CAD) et n'incluent pas les taxes applicables.
                                        </li>
                                        <li>
                                            Les paiements sont traités de manière sécurisée par Stripe.
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>7. Disponibilité du service</h2>
                                    <p>
                                        Nous faisons notre possible pour maintenir le service disponible, mais ne pouvons
                                        garantir une disponibilité ininterrompue. Des interruptions de maintenance ou des
                                        incidents techniques peuvent survenir. GoStudyEasy ne pourra être tenu responsable des
                                        pertes liées à une indisponibilité temporaire.
                                    </p>
                                </section>

                                <section>
                                    <h2>8. Limitation de responsabilité</h2>
                                    <p>
                                        Le contenu généré par GoStudyEasy (résumés, flashcards, quiz, réponses du chat) est
                                        produit par un système automatisé. Il peut contenir des erreurs ou inexactitudes.
                                        GoStudyEasy ne garantit pas l'exactitude, l'exhaustivité ou l'adéquation de ce
                                        contenu à un usage académique spécifique.
                                    </p>
                                    <p className="mt-3">
                                        Dans toute la mesure permise par la loi, notre responsabilité totale ne peut
                                        excéder le montant que vous avez payé au cours des 12 derniers mois.
                                    </p>
                                </section>

                                <section>
                                    <h2>9. Résiliation</h2>
                                    <p>
                                        Vous pouvez supprimer votre compte à tout moment depuis vos paramètres. Nous nous
                                        réservons le droit de suspendre ou résilier un compte en cas de violation des
                                        présentes Conditions, sans préavis et sans remboursement.
                                    </p>
                                </section>

                                <section>
                                    <h2>10. Modifications des Conditions</h2>
                                    <p>
                                        Nous pouvons modifier ces Conditions à tout moment. En cas de changement
                                        significatif, nous vous en informerons par courriel ou via une notification dans
                                        l'application. La poursuite de l'utilisation du service après notification vaut
                                        acceptation des nouvelles Conditions.
                                    </p>
                                </section>

                                <section>
                                    <h2>11. Droit applicable</h2>
                                    <p>
                                        Les présentes Conditions sont régies par les lois de la province d'Ontario et les
                                        lois fédérales du Canada applicables, à l'exclusion de leurs règles de
                                        conflits de lois.
                                    </p>
                                </section>

                                <section>
                                    <h2>12. Contact</h2>
                                    <p>
                                        Pour toute question relative aux présentes Conditions :
                                    </p>
                                    <p className="mt-2">
                                        <strong>GoStudyEasy</strong>
                                        <br />
                                        <a
                                            href="mailto:studylink.uni@gmail.com"
                                            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                                        >
                                            studylink.uni@gmail.com
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
