

export default function Testimonial() {

    return (
        <section className="py-20 sm:py-28 bg-background" id="testimonials">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">What Our Students
                        Say</h2>
                    <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">Thousands of students have transformed
                        their learning experience with StudyLink.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-card border border-border p-8 rounded-2xl shadow-lg flex flex-col items-start">
                        <p className="text-foreground/70 flex-1">"StudyLink has transformed my study habits. I'm more
                            organized and productive than ever before. The scheduling feature is a lifesaver!"</p>
                        <div className="mt-6 flex items-center gap-4">
                            <img alt="Photo of Sarah M." className="size-12 rounded-full object-cover"
                                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWyJhOmZM1Hg7-RoPIV8IgfraZpNTnEFq6ekuo8ACgE_Qv2ZsWQFfAWb1rYven3HT5lhgv-OHflLo3Nv9BIKSj_54kw7_BPmRGOf6HO5Dd_6mLnqWsFp-OgS5ZcM4O3r82evT-wLg5fgDLncwlwShNppl-Jd1M2KSMYuSP_yOopJVl_teJWhMUluDDMUOsvan5MGOp1G-eQMHcu-ghKIwlkzN-Jo2cgJ_EsLCm_CTjZS5FkiSRWDfQ51Kf66xVXzDboW6zwsCF7nzr"/>
                            <div>
                                <p className="font-bold text-foreground">Sarah M.</p>
                                <p className="text-sm text-foreground/60">University Student</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-8 rounded-2xl shadow-lg flex flex-col items-start">
                        <p className="text-foreground/70 flex-1">"The collaboration tools are fantastic. Working with my
                            classmates has never been easier. We can share notes and work on projects seamlessly."</p>
                        <div className="mt-6 flex items-center gap-4">
                            <img alt="Photo of David L." className="size-12 rounded-full object-cover"
                                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-J-uZfN6RDcFDC-5kD49dGSWTlhzOBmqvaX-SjBhkDT9bayKstWnMZYvVx4NMoBKekwu1ngrd-WLVq5KiGQd9Um2r-oi2foUj0bh0xkcU4TtsaMAwNRvtw-ghlG30Ix4TIaUMgDWEXZz8Rm_dEXnzL5aPz1jfnKvQFe8YWH2W14JbP1DUVFkodICRc5Vr3SNRfeO9XVqcV_gvPeSoWexQdU48TK80YN183Aor6Q9fXoLTGj0XzyTSHXG9zu9VKnHVHLlZL3Uih6P8"/>
                            <div>
                                <p className="font-bold text-foreground">David L.</p>
                                <p className="text-sm text-foreground/60">High School Student</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-8 rounded-2xl shadow-lg flex flex-col items-start">
                        <p className="text-foreground/70 flex-1">"I love the progress tracking feature. It helps me stay
                            motivated and focused on my goals. Seeing my improvements over time is incredibly
                            rewarding."</p>
                        <div className="mt-6 flex items-center gap-4">
                            <img alt="Photo of Emily R." className="size-12 rounded-full object-cover"
                                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAEfFuprHbZREg9SnI7-mAkkg5wpsCtFJIqpcWAK8ra1Ix-f1RfzuIkWwAkw0ejSzmUnATBEw48yWOO9ajtRp0SGH3Lvc6CwxsEJRKWGK-uhdHwc5imzvCB_aWnjdR0kI1VfcmNQwQyM2iPwtQPLUvdwf8jFbphxrBHEZacwRgHQplkCNfRtEvprpVo3z9-lcrZhQLWKzXQ-JdjFv7pGK0cl07KwGQKK8Rr7aZ9dnxb00whOEzOecmg50GhgRdr5PkmiDfB_1rcQkQ"/>
                            <div>
                                <p className="font-bold text-foreground">Emily R.</p>
                                <p className="text-sm text-foreground/60">College Student</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}