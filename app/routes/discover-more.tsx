import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";
import { motion } from "framer-motion";
import {
    Home,
    Info,
    Briefcase,
    FileText,
    MessageSquare,
    Video,
    ThumbsUp,
    Shield,
    FileWarning,
    Cookie,
    Lock
} from "lucide-react";
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
    return generateMeta({
        title: "Discover More - HRTek System Resources",
        description: "Explore all resources, legal information, and quick links for HRTek System. Find everything you need in one place.",
        keywords: "HRTek resources, quick links, sitemap, discover more, legal docs, HRTek pages",
        url: "https://hrteksystem.com/discover-more",
        image: "https://hrteksystem.com/og-discover.jpg",
    });
};

const links = [
    { name: "Home", url: "/", icon: Home, description: "Return to our main landing page." },
    { name: "About Us", url: "/about-us", icon: Info, description: "Learn about our mission and vision." },
    { name: "Careers", url: "/careers", icon: Briefcase, description: "Join our team and grow with us." },
    { name: "Blogs", url: "/blog", icon: FileText, description: "Latest insights and HR trends." },
    { name: "Testimonials", url: "/testimonials", icon: MessageSquare, description: "See what our customers say." },
    { name: "Video Tutorials", url: "/video-tutorials", icon: Video, description: "Watch guides to master the platform." },
    { name: "Recommendations", url: "/recommendation", icon: ThumbsUp, description: "Personalized suggestions for you." },
    { name: "Terms & Conditions", url: "/legal/term", icon: FileWarning, description: "Our terms of service agreement." },
    { name: "Privacy Policy", url: "/legal/privacy", icon: Shield, description: "How we protect your data." },
    { name: "Cookie Policy", url: "/legal/cookie", icon: Cookie, description: "Information about cookie usage." },
    { name: "GDPR Compliance", url: "/legal/gdpr", icon: Lock, description: "Our commitment to data privacy." },
];

export default function DiscoverMorePage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Discover More", url: "/discover-more" }
    ]);

    return (
        <>
            <link rel="canonical" href="https://hrteksystem.com/discover-more" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
                <Navbar />

                <main className="flex-grow">
                    {/* Hero Section */}
                    <div className="relative bg-[#001845] py-24 lg:py-32 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                            <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
                            <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-5"></div>
                        </div>

                        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-sm font-semibold mb-6 backdrop-blur-sm">
                                    Explore HRTek System
                                </span>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tight">
                                    Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Everything</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-blue-100/70 max-w-3xl mx-auto leading-relaxed">
                                    Your central hub for resources, legal documentation, and essential navigation.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="max-w-7xl mx-auto px-6 py-24 -mt-20 relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {links.map((link, index) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <Link
                                        to={link.url}
                                        className="group block h-full bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 border border-white/50 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                                    >
                                        {/* Hover Gradient Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-cyan-50/50 transition-all duration-500"></div>

                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="mb-6 flex items-center justify-between">
                                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 text-slate-600 group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30">
                                                    <link.icon size={28} strokeWidth={1.5} />
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-3">
                                                {link.name}
                                            </h3>
                                            <p className="text-slate-500 group-hover:text-slate-600 leading-relaxed">
                                                {link.description}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
