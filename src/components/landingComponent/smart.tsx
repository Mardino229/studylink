

export default function Smart() {

    return (
        <section className="py-20 sm:py-28 bg-background" id="how-it-works">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Smart Academic
                            Dashboard</h2>
                        <p className="mt-4 text-lg text-foreground/70">Our intuitive dashboard provides a comprehensive
                            overview of your academic journey. Track your grades, upcoming deadlines, and study hours
                            all in one place. Stay on top of your game effortlessly.</p>
                        <div className="mt-8 flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 size-6 text-blue-500 mt-1">
                                    <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path clip-rule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              fill-rule="evenodd"></path>
                                    </svg>
                                </div>
                                <p className="text-foreground/70"><strong>Visualize Your Success:</strong> See your progress
                                    with beautiful charts and graphs.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 size-6 text-blue-500 mt-1">
                                    <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path clip-rule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              fill-rule="evenodd"></path>
                                    </svg>
                                </div>
                                <p className="text-foreground/70"><strong>Stay Organized:</strong> Keep track of
                                    assignments, exams, and projects with ease.</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 w-full h-auto">
                        <img alt="A screenshot of the Smart Academic Dashboard feature"
                             className="w-full h-auto rounded-2xl object-cover shadow-2xl"
                             src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2gHTLuXWw99gwTHq32IG1k46iRDjJ8UJDt6AA6H_NzN7bbTS5WrFtRTTt9AaimAd09YfWwRROedbnHItSKwIAe1JhPDFoTumsqbWItWnV_3kTW2gtGu45wW--PHoYWRr0w63cvxOs0z44kYH7jXqzzzh3h3siBEZiAlHnYy4DfhJN9r_fSsS99Pimyf0mBkoQD_Z4keBmm2C8lzSn0tbRcbebQeowJc1MheTljHC7WzPYgLclqZwZA5ZBMrbcCAhzhkuPUiV5u4Ov"/>
                    </div>
                </div>
            </div>
        </section>
    )
}