// app/routes/admin.website.testimonials._index.tsx
import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

// Dummy Data
interface Testimonial {
  id: string;
  name: string;
  title: string;
  organization: string;
  text: string;
  profileImageUrl?: string;
  showOnHomepage: boolean;
  enginePageId?: string; // e.g., 'eng-001'
  status: "Draft" | "Published";
}

const dummyTestimonials: Testimonial[] = [
  {
    id: "test-001",
    name: "Jane Doe",
    title: "Head of Operations",
    organization: "Innovate Corp",
    text: "Our partnership with this platform has revolutionized our workflow. The insights are invaluable!",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29329?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    showOnHomepage: true,
    status: "Published",
  },
  {
    id: "test-002",
    name: "John Smith",
    title: "CTO",
    organization: "Tech Solutions Inc.",
    text: "The AI reports generated are incredibly accurate and save us hundreds of hours.",
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    showOnHomepage: false,
    enginePageId: "eng-001", // Example: specific engine page
    status: "Published",
  },
  {
    id: "test-003",
    name: "Sarah Lee",
    title: "Marketing Director",
    organization: "Global Brands",
    text: "Still drafting my thoughts on the impact, but promising results so far!",
    showOnHomepage: false,
    status: "Draft",
  },
];

export const loader = async () => {
  return json({ testimonials: dummyTestimonials });
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function TestimonialsPage() {
  const { testimonials } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      alert(`Testimonial ${id} deleted! (Action: Delete from DB)`);
      // In a real app, send a DELETE request here
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      alert(`Testimonial ${editingTestimonial.id ? 'updated' : 'added'}!`);
      // In a real app, send a POST/PUT request here
      setIsModalOpen(false);
      setEditingTestimonial(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Testimonials</h2>
        <button
          type="button"
          onClick={() => {
            setEditingTestimonial({
              id: `new-${Date.now()}`,
              name: "",
              title: "",
              organization: "",
              text: "",
              showOnHomepage: true,
              status: "Draft",
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Testimonial
        </button>
      </div>

      {testimonials.length === 0 ? (
        <p className="text-gray-600">No testimonials added yet. Click "Add Testimonial" to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / Org
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Testimonial Text
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {testimonial.profileImageUrl && (
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={testimonial.profileImageUrl} alt="" />
                        </div>
                      )}
                      <div className={classNames(testimonial.profileImageUrl ? 'ml-4' : '')}>
                        <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.title}</div>
                        <div className="text-xs text-gray-400">{testimonial.organization}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-sm overflow-hidden text-ellipsis text-sm text-gray-500">
                    <p className="line-clamp-2">{testimonial.text}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {testimonial.showOnHomepage && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        <GlobeAltIcon className="h-3 w-3 mr-1" /> Homepage
                      </span>
                    )}
                    {testimonial.enginePageId && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <BuildingOfficeIcon className="h-3 w-3 mr-1" /> Engine Page
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={classNames(
                        testimonial.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {testimonial.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(testimonial)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100"
                        title="Edit Testimonial"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                        title="Delete Testimonial"
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

      {/* Testimonial Modal (for Add/Edit) */}
      {isModalOpen && editingTestimonial && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingTestimonial.id.startsWith("new") ? "Add New Testimonial" : "Edit Testimonial"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  value={editingTestimonial.name}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  value={editingTestimonial.title}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  id="organization"
                  value={editingTestimonial.organization}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, organization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">Testimonial Text</label>
                <textarea
                  id="text"
                  value={editingTestimonial.text}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL (Optional)</label>
                <input
                  type="text"
                  id="profileImageUrl"
                  value={editingTestimonial.profileImageUrl || ""}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, profileImageUrl: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700">Show on Homepage?</label>
                <input
                  type="checkbox"
                  id="showOnHomepage"
                  checked={editingTestimonial.showOnHomepage}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, showOnHomepage: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={editingTestimonial.status}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, status: e.target.value as "Draft" | "Published" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}