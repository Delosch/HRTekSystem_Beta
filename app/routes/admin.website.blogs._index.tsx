// app/routes/admin.website.blogs._index.tsx
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Dummy Data
type BlogStatus = "Draft" | "Published" | "Scheduled";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  tags: string[];
  publishStatus: BlogStatus;
  publishedAt?: string;
  scheduledFor?: string;
  coverImageUrl?: string;
}

const dummyBlogPosts: BlogPost[] = [
  {
    id: "blog-001",
    title: "The Future of AI in B2B Operations",
    slug: "future-ai-b2b-operations",
    author: "Alex V.",
    category: "AI & Tech",
    tags: ["AI", "B2B", "Automation"],
    publishStatus: "Published",
    publishedAt: "2025-07-20",
    coverImageUrl: "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "blog-002",
    title: "Optimizing Client Onboarding with CRM Integrations",
    slug: "client-onboarding-crm",
    author: "Maria S.",
    category: "CRM",
    tags: ["CRM", "Onboarding", "Integrations"],
    publishStatus: "Draft",
    publishedAt: undefined,
  },
  {
    id: "blog-003",
    title: "Understanding Your Target Market: A Data-Driven Approach",
    slug: "understanding-target-market",
    author: "Alex V.",
    category: "Marketing",
    tags: ["Marketing", "Data Analytics"],
    publishStatus: "Scheduled",
    scheduledFor: "2025-08-01",
  },
];

export const loader = async () => {
  return json({ blogPosts: dummyBlogPosts });
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function BlogInsightsPage() {
  const { blogPosts } = useLoaderData<typeof loader>();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      alert(`Blog post ${id} deleted! (Action: Delete from DB)`);
      // In a real app, send a DELETE request here
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Blog / Insights Posts</h2>
        <Link
          to="/admin/website/blogs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create New Post
        </Link>
      </div>

      {blogPosts.length === 0 ? (
        <p className="text-gray-600">No blog posts found. Click "Create New Post" to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogPosts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link to={`/blogs/${post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={classNames(
                        post.publishStatus === "Published"
                          ? "bg-green-100 text-green-800"
                          : post.publishStatus === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800",
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {post.publishStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.publishedAt || post.scheduledFor || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/website/blogs/${post.id}/edit`} // Placeholder for edit route
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100"
                        title="Edit Post"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/blogs/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
                        title="Preview Post"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                        title="Delete Post"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
