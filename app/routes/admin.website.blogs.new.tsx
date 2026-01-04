// app/routes/admin.website.blogs.new.tsx
import { useState } from "react";
import { useNavigate } from "@remix-run/react";

export default function NewBlogPostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published" | "Scheduled">("Draft");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("New blog post created! (Action: Save to DB)");
    // In a real app, send data to backend and then navigate
    navigate("/admin/website/blogs"); // Go back to blog list
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-5">Create New Blog Post</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Path)</label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="auto-generated-from-title"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content (WYSIWYG Editor Placeholder)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            placeholder="Start writing your blog post here..."
          ></textarea>
          <p className="mt-2 text-sm text-gray-500">This would typically be a rich text editor (e.g., TinyMCE, Quill, Slate).</p>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Publish Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "Draft" | "Published" | "Scheduled")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
          </select>
          {status === "Scheduled" && (
            <input
              type="datetime-local"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          )}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/admin/website/blogs")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Post
          </button>
        </div>
      </form>
    </div>
  );
}