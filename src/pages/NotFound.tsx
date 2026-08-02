import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import logo from "../assets/mylogo.png";

export default function NotFound() {
    return (
        <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background">

            {/* Background blobs */}
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center"
            >
                {/* Logo */}
                <Link to="/" className="mb-8 flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                    <img src={logo} alt="BlueCurve" className="h-10 w-auto" />
                    <span className="text-xl font-bold text-gray-700 dark:text-gray-200">BlueCurve</span>
                </Link>

                {/* 404 number */}
                <motion.p
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="select-none bg-primary bg-clip-text text-[10rem] font-black leading-none tracking-tighter text-transparent sm:text-[14rem]"
                >
                    404
                </motion.p>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        Page introuvable
                    </h1>
                    <p className="mt-3 max-w-md text-base text-gray-500 dark:text-gray-400">
                        La page que tu cherches n'existe pas ou a été déplacée. Vérifie l'URL ou retourne à l'accueil.
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-10 flex flex-col sm:flex-row items-center gap-3"
                >
                    <Link
                        to="/"
                        className="inline-flex dark:text-blue-500 items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    >
                        <Home size={16} />
                        Retour à l'accueil
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-7 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <ArrowLeft size={16} />
                        Page précédente
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
