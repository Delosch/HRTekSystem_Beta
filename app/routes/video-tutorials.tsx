import { MetaFunction } from "@remix-run/node";
import { useState } from "react";
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
        title: "HR Transformation Intelligence (HTI)",
        description: "Explore the cognitive advisory layer that delivers decision intelligence, moving beyond basic dashboards and reports.",
        duration: "Engine Guide",
        category: "HTI",
        videoId: "3_mEgGnjFXc"
    },
    {
        id: 2,
        title: "What is HRTek?",
        description: "An introduction to the HRTek platform and its capabilities for transforming your HR operations.",
        duration: "Overview",
        category: "Platform",
        videoId: "pK8XCrflcdc"
    },
    {
        id: 3,
        title: "Intelligent Change Management (ICMS)",
        description: "Manage the people side of transformation with HR-Tek’s strategic ICMS capability, ensuring successful adoption.",
        duration: "Engine Guide",
        category: "ICMS",
        videoId: "pNXK9mVIqpc"
    },
    {
        id: 4,
        title: "HR Transformation Roadmap Generator",
        description: "Step-by-step guide to generating a comprehensive, actionable transformation roadmap for your organization.",
        duration: "Engine Guide",
        category: "Roadmap",
        videoId: "jXtoM_-kiNY"
    },
    {
        id: 5,
        title: "HR Technology Maturity Analysis",
        description: "Learn how to assess your current HR technology landscape and identify gaps with our Maturity Engine.",
        duration: "Engine Guide",
        category: "Maturity",
        videoId: "bsW0rYwrBbQ"
    },
    {
        id: 6,
        title: "HCM Vendor Fit & Selection",
        description: "Discover how to find the perfect HCM vendor match based on your unique organizational requirements.",
        duration: "Engine Guide",
        category: "Vendor Fit",
        videoId: "yTvgbv1Z1RU"
    },
    {
        id: 7,
        title: "Shared Services Designer",
        description: "A tutorial on designing and optimizing your HR Shared Services model for maximum efficiency.",
        duration: "Engine Guide",
        category: "Shared Services",
        videoId: "YOVD_7wszU4"
    }
];

export default function VideoTutorialsPage() {

    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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

                <main className="flex-grow relative">
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
                                    onClick={() => setSelectedVideo(video.videoId)}
                                >
                                    {/* Thumbnail Container */}
                                    <div className="relative h-48 overflow-hidden bg-slate-200">
                                        <img
                                            src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
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

                {/* Video Modal Popup */}
                {selectedVideo && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <div
                            className="bg-black relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside player
                        >
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </>
    );
}
