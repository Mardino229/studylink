import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../assets/mylogo.png";

export default function Footer() {
    const { t } = useTranslation('landing');

    return (
        <footer className="bg-background text-foreground/70 border-t border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="BlueCurve" className="sm:h-12 h-10 w-auto" />
                            <h2 className="text-foreground text-2xl font-bold">BlueCurve</h2>
                        </div>
                        <p className="mt-4 text-sm">{t('footer.tagline')}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-3 gap-8">
                        <div>
                            <h3 className="text-base font-semibold text-foreground">{t('footer.platform')}</h3>
                            <ul className="mt-4 space-y-2">
                                <li><Link className="hover:text-foreground transition-colors" to={{ pathname: "/", hash: "#key-features" }}>{t('footer.features')}</Link></li>
                                <li><Link className="hover:text-foreground transition-colors" to={{ pathname: "/", hash: "#pricing" }}>{t('footer.pricing')}</Link></li>
                                <li><Link className="hover:text-foreground transition-colors" to="/login">{t('footer.login')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">{t('footer.company')}</h3>
                            <ul className="mt-4 space-y-2">
                                <li><Link className="hover:text-foreground transition-colors" to="/about">{t('footer.about')}</Link></li>
                                <li><Link className="hover:text-foreground transition-colors" to={{ pathname: "/", hash: "#faq" }}>{t('footer.faq')}</Link></li>
                                <li><a className="hover:text-foreground transition-colors" href="mailto:contact@bluecurvespace.com">{t('footer.contact')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">{t('footer.legal')}</h3>
                            <ul className="mt-4 space-y-2">
                                <li><Link className="hover:text-foreground transition-colors" to="/privacy">{t('footer.privacy')}</Link></li>
                                <li><Link className="hover:text-foreground transition-colors" to="/terms">{t('footer.terms')}</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm">{t('footer.copyright')}</p>
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        <a className="text-foreground/70 hover:text-foreground" href="https://www.instagram.com/blue.curve" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg>
                        </a>
                        <a className="text-foreground/70 hover:text-foreground" href="https://www.linkedin.com/in/bluecurve" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path></svg>
                        </a>
                    </div> 
                </div>
            </div>
        </footer>
    );
}
