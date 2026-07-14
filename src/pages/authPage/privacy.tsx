import Header from "../../components/landingComponent/header.tsx";
import Footer from "../../components/landingComponent/footer.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";

const LAST_UPDATED = "13 juillet 2026";

export default function Privacy() {
    return (
        <>
            <PageMeta
                title="Politique de confidentialité • StudyLink"
                description="Comment StudyLink collecte, utilise et protège vos données personnelles."
            />
            <div className="relative flex min-h-screen flex-col bg-muted dark:bg-background">
                <div className="layout-container flex h-full grow flex-col">
                    <Header />
                    <main className="flex-1">
                        <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                            {/* Header */}
                            <div className="mb-12">
                                <p className="mb-2 text-xs text-center font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    Légal
                                </p>
                                <h1 className="sm:text-4xl text-3xl font-bold tracking-tight text-foreground">
                                    Politique de confidentialité
                                </h1>
                                <p className="mt-3 text-foreground/60">
                                    Dernière mise à jour : {LAST_UPDATED}
                                </p>
                            </div>

                            <div className="space-y-10 text-foreground/80 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-foreground/75 [&_li]:list-disc [&_li]:leading-relaxed">

                                <p>
                                    StudyLink (<strong>"nous"</strong>, <strong>"notre"</strong>) prend la confidentialité de
                                    vos données au sérieux. Cette politique explique quelles informations nous collectons,
                                    comment nous les utilisons et quels sont vos droits, conformément à la{" "}
                                    <em>Loi sur la protection des renseignements personnels et les documents électroniques</em>{" "}
                                    (LPRPDE / PIPEDA).
                                </p>

                                <section>
                                    <h2>1. Données collectées</h2>
                                    <p>
                                        Lorsque vous utilisez StudyLink, nous collectons les catégories de données suivantes :
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Informations de compte</strong> — votre adresse courriel et votre nom
                                            d'affichage, fournis lors de l'inscription.
                                        </li>
                                        <li>
                                            <strong>Fichiers importés</strong> — les documents que vous déposez sur la
                                            plateforme (PDF, DOCX, PPTX) pour générer des résumés, flashcards ou quiz.
                                        </li>
                                        <li>
                                            <strong>Contenu généré</strong> — les artefacts produits par la plateforme
                                            (résumés, flashcards, quiz, historique de chat) associés à votre compte.
                                        </li>
                                        <li>
                                            <strong>Données de paiement</strong> — le traitement est entièrement délégué à
                                            Stripe. Nous ne stockons jamais de numéros de carte ou d'informations bancaires
                                            directement.
                                        </li>
                                        <li>
                                            <strong>Données d'utilisation</strong> — solde de jetons, historique de
                                            transactions, statistiques agrégées de révision (nombre de sessions, modules
                                            consultés).
                                        </li>
                                        <li>
                                            <strong>Données techniques</strong> — adresse IP, type de navigateur et logs
                                            d'accès à des fins de sécurité et de débogage.
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>2. Utilisation de vos données</h2>
                                    <p>Vos données sont utilisées pour :</p>
                                    <ul>
                                        <li>Fournir et maintenir le service StudyLink.</li>
                                        <li>
                                            Générer les artefacts que vous demandez (résumés, flashcards, quiz, réponses du
                                            chat).
                                        </li>
                                        <li>Gérer votre abonnement, vos packs de jetons et vos paiements.</li>
                                        <li>
                                            Vous envoyer des communications transactionnelles (confirmation de paiement,
                                            mises à jour importantes du service).
                                        </li>
                                        <li>Détecter et prévenir les abus ou violations de nos conditions d'utilisation.</li>
                                    </ul>
                                    <p className="mt-3">
                                        <strong>Nous ne vendons pas vos données personnelles à des tiers.</strong>
                                    </p>
                                </section>

                                <section>
                                    <h2>3. Services tiers</h2>
                                    <p>StudyLink fait appel aux services tiers suivants :</p>
                                    <ul>
                                        <li>
                                            <strong>Google </strong> — vos fichiers et
                                            messages de chat sont transmis à une API d'intelligence artificielle pour
                                            produire les résumés, podcast, flashcards, quiz et réponses. Ces données sont traitées
                                            conformément à la politique de confidentialité du fournisseur d'IA. Nous vous
                                            déconseillons d'importer des documents contenant des informations sensibles ou
                                            confidentielles.
                                        </li>
                                        <li>
                                            <strong>Stripe</strong> — traitement sécurisé des paiements par carte de crédit
                                            et des abonnements. Stripe est certifié PCI DSS.
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2>4. Conservation des données</h2>
                                    <p>
                                        Vos données sont conservées aussi longtemps que votre compte est actif. Si vous
                                        demandez la suppression de votre compte, nous effacerons vos données personnelles
                                        et vos fichiers importés dans un délai raisonnable, sauf obligation légale contraire.
                                        Les données de transaction peuvent être conservées pour des raisons comptables
                                        conformément à la loi applicable.
                                    </p>
                                </section>

                                <section>
                                    <h2>5. Vos droits (PIPEDA)</h2>
                                    <p>Conformément à la LPRPDE, vous avez le droit de :</p>
                                    <ul>
                                        <li>Accéder aux renseignements personnels que nous détenons sur vous.</li>
                                        <li>Demander la correction de données inexactes.</li>
                                        <li>Retirer votre consentement au traitement de vos données.</li>
                                        <li>Demander la suppression de votre compte et de vos données.</li>
                                    </ul>
                                    <p className="mt-3">
                                        Pour exercer ces droits, contactez-nous à{" "}
                                        <a
                                            href="mailto:studylink.uni@gmail.com"
                                            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                                        >
                                            studylink.uni@gmail.com
                                        </a>
                                        .
                                    </p>
                                </section>

                                <section>
                                    <h2>6. Cookies et stockage local</h2>
                                    <p>
                                        StudyLink utilise des cookies de session et du stockage local du navigateur
                                        uniquement à des fins d'authentification et de préférences d'interface (thème clair /
                                        sombre). Nous n'utilisons pas de cookies publicitaires ou de traceurs tiers.
                                    </p>
                                </section>

                                <section>
                                    <h2>7. Sécurité</h2>
                                    <p>
                                        Nous appliquons des mesures de sécurité standard (chiffrement en transit via HTTPS,
                                        authentification sécurisée) pour protéger vos données. Aucun système n'est
                                        infaillible ; en cas de compromission, nous vous notifierons dans les délais prévus
                                        par la loi.
                                    </p>
                                </section>

                                <section>
                                    <h2>8. Modifications</h2>
                                    <p>
                                        Nous pouvons mettre à jour cette politique à tout moment. En cas de changement
                                        significatif, nous vous en informerons par courriel ou via une notification dans
                                        l'application. La date de dernière mise à jour est indiquée en haut de cette page.
                                    </p>
                                </section>

                                <section>
                                    <h2>9. Contact</h2>
                                    <p>
                                        Pour toute question relative à cette politique ou à vos données personnelles :
                                    </p>
                                    <p className="mt-2">
                                        <strong>StudyLink</strong>
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
