import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight, TrendingUp, Sparkles, BookOpen, Tag } from "lucide-react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "../components/Footer";
import { MetaFunction } from "@remix-run/node";
import { generateMeta, generateBlogPostSchema, generateBreadcrumbSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Insights & Innovation Blog",
    description: "Stay ahead with expert insights on HR technology, digital transformation, workforce management, and industry trends from HRTek System. Read the latest articles from HR experts.",
    keywords: "HR blog, HR technology trends, digital transformation, workforce management insights, HCM solutions, HR best practices",
    url: "https://hrteksystem.com/blog",
    type: "blog",
    image: "https://hrteksystem.com/og-blog.jpg",
  });
};

export default function BlogPage() {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "HR Tech", "Transformation", "Analytics", "Future of Work"];

  // Enhanced blog data with categories, tags, and metadata
  const blogs = [
    {
      id: 1,
      title: "HR Trends in 2025",
      category: "HR Tech",
      tags: ["AI", "Trends", "Innovation"],
      author: "HRTek Research Team",
      date: "13 November 2024",
      readTime: "8 min read",
      featured: true,
      excerpt:
        "Explore the key HR trends shaping the future of work in 2025 — from AI-driven hiring to employee well-being strategies. Discover what forward-thinking teams are doing to stay ahead.",
      imageUrl: "/assets/blogAssets/blogThumb1.png",
      content: `13 November 2024

Stay Ahead with the Latest HR Tech Trends: What You Need to Know in 2025

In the rapidly evolving landscape of Human Resources, staying up to date with the latest technology trends is no longer a luxury—it's a necessity. As organizations strive to remain competitive, leveraging the latest HR tech innovations is critical to optimizing workforce management, enhancing employee experience, and driving organizational success.

Our website serves as your go-to hub for insights, trends, and innovations in the world of HR technology. In this blog, we dive into some of the most impactful HR tech trends shaping the industry in 2024 and how your organization can benefit from them.

1. Generative AI for HR: The Next Frontier

The rise of Generative AI is transforming HR processes across the board. Tools like ChatGPT and other AI-powered platforms are enabling HR teams to automate tasks such as candidate screening, employee engagement surveys, and even personalized learning recommendations.`,
    },
    {
      id: 2,
      title: "HCM Solutions: The Choice for a Future-Ready HR Transformation",
      category: "Transformation",
      tags: ["HCM", "Digital", "Strategy"],
      author: "Strategic Insights Team",
      date: "25 October 2024",
      readTime: "6 min read",
      featured: false,
      excerpt:
        "Uncover how modern Human Capital Management (HCM) solutions are empowering organizations to streamline operations, enhance workforce engagement, and lead the way in digital HR transformation.",
      imageUrl: "/assets/blogAssets/blogThumb2.png",
      content: `25 October 2024

HCM Solutions: The Choice for a Future-Ready HR Transformation

In today's fast-changing business landscape, Human Capital Management (HCM) solutions are no longer optional—they're essential. With increasing emphasis on HR automation, data-driven decision-making, and enhancing employee experience, HCM solutions are becoming the backbone of future-ready organizations.`,
    },
  ];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBlog = blogs.find(b => b.featured);

  const handleToggle = (id: number) => {
    setSelectedBlogId((prevId) => (prevId === id ? null : id));
  };

  // Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" }
  ]);

  // Blog Post Schemas for featured articles
  const blogSchemas = blogs.map(blog => generateBlogPostSchema({
    title: blog.title,
    description: blog.excerpt,
    image: `https://hrteksystem.com${blog.imageUrl}`,
    author: blog.author,
    datePublished: "2024-11-13",
    url: `https://hrteksystem.com/blog#${blog.id}`
  }));

  return (
    <>
      <link rel="canonical" href="https://hrteksystem.com/blog" />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Blog Post Schemas */}
      {blogSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main className="bg-[#F8FAFC] min-h-screen font-outfit">
        <Navbar />

        {/* Premium Hero Section */}
        <div className="relative bg-gradient-to-br from-[#001845] via-[#023e8a] to-[#0077b6] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/90 text-sm font-medium">Knowledge Hub</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                  Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Innovation</span>
                </h1>

                <p className="text-xl text-blue-100/80 leading-relaxed max-w-xl">
                  Stay ahead of the curve with expert insights, strategic advice, and real-world stories from the evolving world of Human Resources.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-medium">{blogs.length} Articles</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">Weekly Updates</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center lg:justify-end"
              >
                <img
                  src="/assets/blogAssets/blogArt.png"
                  alt="Blog Illustration"
                  className="max-w-full h-auto rounded-2xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC" />
            </svg>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-8 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredBlog && (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-black text-[#000033]">Featured Article</h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-100 group cursor-pointer"
              onClick={() => handleToggle(featuredBlog.id)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src={featuredBlog.imageUrl}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                      FEATURED
                    </span>
                  </div>
                </div>

                <div className="p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                      {featuredBlog.category}
                    </span>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      {featuredBlog.date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {featuredBlog.readTime}
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-[#000033] mb-4 group-hover:text-blue-600 transition-colors">
                    {featuredBlog.title}
                  </h3>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {featuredBlog.excerpt}
                  </p>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500">By {featuredBlog.author}</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-black text-[#000033] mb-12">Latest Articles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredBlogs.filter(b => !b.featured).map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 border border-slate-100 group cursor-pointer flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold rounded-full">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {blog.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readTime}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#000033] mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                      {blog.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 leading-relaxed flex-grow">
                      {blog.excerpt.substring(0, 120)}...
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleToggle(blog.id)}
                      className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all"
                    >
                      {selectedBlogId === blog.id ? "Hide Details" : "Read More"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Expanded Content Modal */}
        <AnimatePresence>
          {selectedBlogId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedBlogId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl"
              >
                {blogs.find(b => b.id === selectedBlogId) && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-4xl font-black text-[#000033] mb-4">
                        {blogs.find(b => b.id === selectedBlogId)!.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{blogs.find(b => b.id === selectedBlogId)!.author}</span>
                        <span>•</span>
                        <span>{blogs.find(b => b.id === selectedBlogId)!.date}</span>
                        <span>•</span>
                        <span>{blogs.find(b => b.id === selectedBlogId)!.readTime}</span>
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none whitespace-pre-line text-slate-700 leading-relaxed">
                      {blogs.find(b => b.id === selectedBlogId)!.content}
                    </div>
                    <button
                      onClick={() => setSelectedBlogId(null)}
                      className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Newsletter CTA */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-blue-600/30">
            <h3 className="text-3xl font-black mb-4">Stay in the Loop</h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for fresh HR insights, industry trends, and exclusive content delivered to your inbox.
            </p>
            <form className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:ring-4 focus:ring-white/30 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
