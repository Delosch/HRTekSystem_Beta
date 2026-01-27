import { MetaFunction } from "@remix-run/node";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
    return generateMeta({
        title: "Client Testimonials - Success Stories | HRTek System",
        description: "Read what our clients say about HRTek System. Discover success stories from organizations that transformed their HR operations with our AI-powered solutions.",
        keywords: "HRTek testimonials, client reviews, success stories, customer feedback, HR transformation results, user experiences",
        url: "https://hrteksystem.com/testimonials",
        image: "https://hrteksystem.com/og-testimonials.jpg",
    });
};

// Sample Testimonials Data
const testimonials = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "CHRO, Global Tech Solutions",
        content: "HRTek System completely revolutionized how we approach our HR transformation. The roadmap generator gave us clarity we hadn't found in years of consulting.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "VP of People, FinServe Inc.",
        content: "The HCM Vendor Fit Engine saved us months of research. We found the perfect match for our unique compliance needs in days, not quarters.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        role: "Director of HR Ops, HealthPlus",
        content: "Their Shared Service Designer allowed us to visualize our new operating model before spending a dime on implementation. A game changer.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        id: 4,
        name: "David Kim",
        role: "CTO, NextGen Retail",
        content: "Finally, a tool that speaks both HR and IT. The Digital Maturity Assessment bridged the gap between our departments perfectly.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        id: 5,
        name: "Amanda Low",
        role: "Head of Talent, Creative Agency",
        content: "The user experience is unmatched. It feels like a consumer app but packs enterprise-grade power. My team actually enjoys using it.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        id: 6,
        name: "James Wilson",
        role: "CEO, Wilson Logistics",
        content: "We needed a partner, not just software. HRTek provided the strategic insights that helped us scale our workforce by 300% without breaking.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
];

export default function TestimonialsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Testimonials", url: "/testimonials" }
    ]);

    return (
        <>
            <link rel="canonical" href="https://hrteksystem.com/testimonials" />
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
                            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold mb-6">
                                    Success Stories
                                </span>
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                                    Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Industry Leaders</span>
                                </h1>
                                <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
                                    Don't just take our word for it. See how HRTek System is empowering organizations to redefine their human resource strategies.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Testimonials Grid */}
                    <div className="max-w-7xl mx-auto px-6 py-20 -mt-20 relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 border border-slate-100 flex flex-col h-full"
                                >
                                    <div className="mb-6 text-blue-500">
                                        <Quote size={40} className="fill-blue-500/10" />
                                    </div>

                                    <p className="text-slate-600 italic mb-8 flex-grow leading-relaxed">
                                        "{testimonial.content}"
                                    </p>

                                    <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                        />
                                        <div>
                                            <h4 className="font-bold text-[#000033] text-sm">{testimonial.name}</h4>
                                            <p className="text-xs text-slate-500 font-medium">{testimonial.role}</p>
                                        </div>
                                        <div className="ml-auto flex gap-0.5">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="max-w-4xl mx-auto px-6 pb-24 text-center">
                        <h2 className="text-3xl font-bold text-[#000033] mb-6">Ready to write your own success story?</h2>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl shadow-blue-600/30"
                        >
                            Start Your Transformation
                        </a>
                    </div>

                </main>
                <Footer />
            </div>
        </>
    );
}
