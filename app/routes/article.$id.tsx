import { useParams, Link } from "@remix-run/react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";
import { blogs } from "~/data/blogs";

export default function ArticlePage() {
  const { id } = useParams();
  const article = blogs.find(b => b.slug === id || b.id === Number(id));

  if (!article) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-3xl font-bold">Article not found</h1>
        <Link to="/articles" className="text-blue-600 underline">
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-[#F8FAFC] min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">

        <Link
          to="/articles"
          className="text-blue-600 font-semibold mb-10 inline-block"
        >

          ← Back to Articles
        </Link>



        <h1 className="text-4xl font-black text-[#000033] mb-4">
          {article.title}
        </h1>

        <div className="text-slate-500 mb-10">
          {article.author} • {article.date} • {article.readTime}
        </div>

        <div className="prose max-w-none whitespace-pre-line text-slate-700">
          {article.content}
        </div>

      </div>

      <Footer />
    </main>
  );
}
