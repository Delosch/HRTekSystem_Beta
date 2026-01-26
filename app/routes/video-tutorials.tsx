import { MetaFunction } from "@remix-run/node";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";
import { motion } from "framer-motion";
import { Play, Clock, BookOpen } from "lucide-react";
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
    return generateMeta({
        title: "Video Tutorials - Learn HRTek System",
        description: "Watch our comprehensive video tutorials to master HRTek System. Step-by-step guides for HR transformation, assessment tools, and platform features.",
        keywords: "HRTek tutorials, HR software training, video guides, how to use HRTek, platform tutorials, HR transformation training",
        url: "https://hrteksystem.com/video-tutorials",
        image: "https://hrteksystem.com/og-tutorials.jpg",
    });
};

// Sample Video Data
const videos = [
    {
        id: 1,
        title: "Getting Started with HRTek",
        description: "A comprehensive overview of the dashboard and key features. Start here to get up and running quickly.",
        duration: "5:30",
        category: "Onboarding",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "Generating Your Transformation Roadmap",
        description: "Learn how to use our AI engine to create a tailored 12-month transformation plan for your organization.",
        duration: "8:45",
        category: "Strategy",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        title: "HCM Vendor Fit Analysis Deep Dive",
        description: "Master the art of selecting the right tech stack. We walk you through the vendor matching algorithm inputs.",
        duration: "12:20",
        category: "Procurement",
        thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        title: "Designing HR Shared Services",
        description: "Step-by-step guide to modeling your new service delivery center using our interactive design tools.",
        duration: "10:15",
        category: "Operations",
        thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5,
        title: "Change Management Best Practices",
        description: "Expert tips on using our change module to drive adoption and minimize resistance during rollout.",
        duration: "6:50",
        category: "Change Mgmt",
        thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 6,
        title: "Understanding Digital Maturity Scores",
        description: "How to interpret your maturity analysis report and use it to benchmark against industry standards.",
        duration: "7:10",
        category: "Analytics",
        thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
];

export default function VideoTutorialsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Video Tutorials", url: "/video-tutorials" }
    ]);

    return (
        <>
            <link rel="canonical" href="https://hrteksystem.com/video-tutorials" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
                <Navbar />

                <main className="flex-grow">
                    {/* Hero Section */}
                    <div className="relative bg-[#001845] py-20 lg:py-32 overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                            <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-sm font-semibold mb-6">
                                    Learning Center
                                </span>
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                                    Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">HRTek Platform</span>
                                </h1>
                                <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
                                    Visual guides and in-depth tutorials to help you get the most out of your powerful new tools.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Videos Grid */}
                    <div className="max-w-7xl mx-auto px-6 py-20 -mt-20 relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videos.map((video, index) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 border border-slate-100 group cursor-pointer"
                                >
                                    {/* Thumbnail Container */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                                                <Play className="w-5 h-5 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
                                            <Clock size={10} />
                                            {video.duration}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                {video.category}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-[#000033] mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                            {video.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                            {video.description}
                                        </p>
                                        <button className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:gap-3 transition-all">
                                            Watch Tutorial <BookOpen size={14} />
                                        </button>
                                    </div>
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
