import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export const loader: LoaderFunction = async () => {
    return json({});
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const blogData = {
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        category: formData.get("category") as string,
        author: formData.get("author") as string,
        excerpt: formData.get("excerpt") as string,
        content: formData.get("content") as string,
        featured_image: formData.get("featured_image") as string,
        tags: formData.get("tags") as string,
        status: formData.get("status") as string,
        publish_date: formData.get("publish_date") as string,
    };

    if (!blogData.title || !blogData.content) {
        return json({ error: "Title and content are required" }, { status: 400 });
    }

    try {
        // TODO: Save to database
        // For now, just redirect back to admin
        console.log("Blog post data:", blogData);

        return redirect("/admin");
    } catch (error) {
        console.error("Error creating blog post:", error);
        return json({ error: "Failed to create blog post" }, { status: 500 });
    }
};

export default function NewBlogPost() {
    const actionData = useActionData<{ error?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [title, setTitle] = useState("");

    // Auto-generate slug from title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Link
                    to="/admin"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <PencilSquareIcon className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Blog Post</h1>
                        <p className="text-gray-600 mt-1">Draft and publish a new article</p>
                    </div>
                </div>
            </div>

            {actionData?.error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{actionData.error}</p>
                </div>
            )}

            <Form method="post" className="space-y-6">
                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Post Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter an engaging title..."
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                URL Slug
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                defaultValue={generateSlug(title)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                placeholder="url-friendly-slug"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-generated from title, can be edited</p>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                                Excerpt
                            </label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Brief summary for preview cards..."
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                required
                                rows={15}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                placeholder="Write your blog post content here... (Markdown supported)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Supports Markdown formatting</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metadata */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    <option value="HR Technology">HR Technology</option>
                                    <option value="Digital Transformation">Digital Transformation</option>
                                    <option value="Best Practices">Best Practices</option>
                                    <option value="Case Studies">Case Studies</option>
                                    <option value="Industry News">Industry News</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    defaultValue="Admin"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="hr, technology, transformation (comma-separated)"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-2">
                                    Featured Image URL
                                </label>
                                <input
                                    type="url"
                                    id="featured_image"
                                    name="featured_image"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue="draft"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Publish Date
                                </label>
                                <input
                                    type="datetime-local"
                                    id="publish_date"
                                    name="publish_date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Creating Post..." : "Create Blog Post"}
                    </button>
                    <Link
                        to="/admin"
                        className="flex-1 bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
                    >
                        Cancel
                    </Link>
                </div>
            </Form>
        </div>
    );
}
