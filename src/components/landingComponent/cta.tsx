import {Link} from "react-router-dom";
import { useEffect, useState, useCallback, type ComponentType } from "react";


export default function Cta() {
    const [animData, setAnimData] = useState<any | null>(null);
    const [LottieComp, setLottieComp] = useState<ComponentType<any> | null>(null);

    useEffect(() => {
        let mounted = true;
        // Lightweight Lottie JSON (public CDN). Replace with your own if desired.
        const url = "https://assets4.lottiefiles.com/packages/lf20_jcikwtux.json";
        fetch(url)
            .then((r) => r.json())
            .then((json) => { if (mounted) setAnimData(json); })
            .catch(() => {});
        // Dynamically import lottie-react to avoid build-time resolution errors if not installed yet
        import("lottie-react").then((mod: any) => {
            if (mounted) setLottieComp(() => mod.default);
        }).catch(() => {});
        return () => { mounted = false; };
    }, []);

    const fireConfetti = useCallback(() => {
        const count = 90;
        const defaults = { origin: { y: 0.65 } } as const;
        // Dynamically import canvas-confetti to avoid build-time resolution errors
        import("canvas-confetti").then(({ default: confetti }) => {
            function fire(particleRatio: number, opts: any) {
                confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
            }
            fire(0.25, { spread: 26, startVelocity: 45 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
            fire(0.1, { spread: 120, startVelocity: 35, decay: 0.92, scalar: 1.1 });
            fire(0.1, { spread: 120, startVelocity: 25 });
        }).catch(() => {});
    }, []);

    return (
        <section className="py-20 sm:py-28 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 sm:p-12 lg:p-16 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Ready to Elevate Your
                        Academic Journey?</h2>
                    <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">Join thousands of successful students
                        and take control of your learning today.</p>
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <Link
                            to="/register"
                            onClick={fireConfetti}
                            className="flex mx-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-white text-blue-600 text-lg font-bold shadow-lg hover:bg-white/90 transition-colors duration-300"
                        >
                            <span className="truncate">Start Your Free Trial Now</span>
                        </Link>
                        {animData && LottieComp && (
                            <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto">
                                <LottieComp animationData={animData} loop autoplay />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}