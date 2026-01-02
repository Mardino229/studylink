

export default function Faq() {

    return (
        <section className="py-20 sm:py-28 bg-muted">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Frequently Asked
                        Questions</h2>
                    <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">Have questions? We've got answers. Here
                        are some of the most common questions we get.</p>
                </div>
                <div className="mt-16 max-w-4xl mx-auto space-y-4">
                    <details className="group border-b border-border pb-4" open={true}>
                        <summary className="flex cursor-pointer items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">What is StudyLink?</h3>
                            <div className="relative size-6 ml-4">
                                <svg
                                    className="h-6 w-6 text-foreground/60 transition-transform duration-300 group-open:rotate-180"
                                    fill="none" stroke="currentColor" stroke-linecap="round" strokeLinejoin="round"
                                    stroke-width="2" viewBox="0 0 24 24">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </div>
                        </summary>
                        <p className="mt-4 text-foreground/70">StudyLink is an all-in-one educational platform designed to
                            help students organize their studies, collaborate with peers, and track their academic
                            progress. Our goal is to make learning more efficient and effective.</p>
                    </details>
                    <details className="group border-b border-border pb-4">
                        <summary className="flex cursor-pointer items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Is StudyLink free to use?</h3>
                            <div className="relative size-6 ml-4">
                                <svg
                                    className="h-6 w-6 text-foreground/60 transition-transform duration-300 group-open:rotate-180"
                                    fill="none" stroke="currentColor" stroke-linecap="round" strokeLinejoin="round"
                                    stroke-width="2" viewBox="0 0 24 24">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </div>
                        </summary>
                        <p className="mt-4 text-foreground/70">StudyLink offers a free basic plan with essential features.
                            We also have premium plans with advanced functionalities for a more comprehensive learning
                            experience. You can start with a free trial to explore all our features.</p>
                    </details>
                    <details className="group border-b border-border pb-4">
                        <summary className="flex cursor-pointer items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">What devices are supported?</h3>
                            <div className="relative size-6 ml-4">
                                <svg
                                    className="h-6 w-6 text-foreground/60 transition-transform duration-300 group-open:rotate-180"
                                    fill="none" stroke="currentColor" stroke-linecap="round" strokeLinejoin="round"
                                    stroke-width="2" viewBox="0 0 24 24">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </div>
                        </summary>
                        <p className="mt-4 text-foreground/70">StudyLink is a web-based platform, so you can access it from
                            any device with an internet browser, including desktops, laptops, tablets, and smartphones.
                            Our platform is fully responsive to ensure a great user experience on all screen sizes.</p>
                    </details>
                    <details className="group border-b border-border pb-4">
                        <summary className="flex cursor-pointer items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">How does the collaboration feature
                                work?</h3>
                            <div className="relative size-6 ml-4">
                                <svg
                                    className="h-6 w-6 text-foreground/60 transition-transform duration-300 group-open:rotate-180"
                                    fill="none" stroke="currentColor" stroke-linecap="round" strokeLinejoin="round"
                                    stroke-width="2" viewBox="0 0 24 24">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </div>
                        </summary>
                        <p className="mt-4 text-foreground/70">Our collaboration tools allow you to create or join study
                            groups, share documents and notes, and communicate with your peers in real-time. It's
                            designed to facilitate teamwork and group projects seamlessly.</p>
                    </details>
                    <details className="group pb-4">
                        <summary className="flex cursor-pointer items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Can I cancel my subscription
                                anytime?</h3>
                            <div className="relative size-6 ml-4">
                                <svg
                                    className="h-6 w-6 text-foreground/60 transition-transform duration-300 group-open:rotate-180"
                                    fill="none" stroke="currentColor" stroke-linecap="round" strokeLinejoin="round"
                                    stroke-width="2" viewBox="0 0 24 24">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </div>
                        </summary>
                        <p className="mt-4 text-foreground/70">Yes, you can cancel your premium subscription at any time.
                            You will continue to have access to premium features until the end of your billing period.
                            After that, your account will revert to the free basic plan.</p>
                    </details>
                </div>
            </div>
        </section>
    )
}