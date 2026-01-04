// app/routes/admin.website.banners._index.tsx
import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// Dummy Data
type BannerType = "Top bar" | "Modal" | "Engine page block";
type BannerStatus = "Active" | "Draft";

interface Banner {
  id: string;
  text: string;
  ctaText?: string;
  ctaLink?: string;
  type: BannerType;
  showOnHomepage: boolean;
  showOnEnginePages: string[]; // Array of engine IDs or 'all'
  startDate: string;
  endDate: string;
  status: BannerStatus;
  backgroundColor?: string;
  icon?: string; // Icon class or URL
}

const dummyBanners: Banner[] = [
  {
    id: "banner-001",
    text: "Limited Time Offer: Get 20% off all new subscriptions!",
    ctaText: "Claim Offer",
    ctaLink: "/pricing",
    type: "Top bar",
    showOnHomepage: true,
    showOnEnginePages: [],
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    status: "Active",
    backgroundColor: "#1D4ED8", // blue-700
    icon: "🎉",
  },
  {
    id: "banner-002",
    text: "New Feature Alert: AI Report Generation is Live!",
    ctaText: "Learn More",
    ctaLink: "/features/ai-reports",
    type: "Modal",
    showOnHomepage: true,
    showOnEnginePages: [],
    startDate: "2025-07-20",
    endDate: "2025-08-31",
    status: "Active",
  },
  {
    id: "banner-003",
    text: "Vendor Fit Engine updates. Review documentation.",
    type: "Engine page block",
    showOnHomepage: false,
    showOnEnginePages: ["eng-001"], // Specific engine
    startDate: "2025-07-20",
    endDate: "2025-08-31",
    status: "Draft",
    backgroundColor: "#DC2626", // red-600
    icon: "💡",
  },
];

export const loader = async () => {
  return json({ banners: dummyBanners });
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function BannersPage() {
  const { banners } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      alert(`Banner ${id} deleted! (Action: Delete from DB)`);
      // In a real app, send a DELETE request here
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      alert(`Banner ${editingBanner.id.startsWith("new") ? 'added' : 'updated'}!`);
      // In a real app, send a POST/PUT request here
      setIsModalOpen(false);
      setEditingBanner(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Announcements & Banners</h2>
        <button
          type="button"
          onClick={() => {
            setEditingBanner({
              id: `new-${Date.now()}`,
              text: "",
              type: "Top bar",
              showOnHomepage: true,
              showOnEnginePages: [],
              startDate: new Date().toISOString().slice(0, 10), // Current date
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 7 days from now
              status: "Draft",
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add New Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <p className="text-gray-600">No banners added yet. Click "Add New Banner" to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner Text
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
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
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="px-6 py-4 max-w-sm overflow-hidden text-ellipsis text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {banner.icon && <span className="mr-2 text-xl">{banner.icon}</span>}
                      <p className="line-clamp-2">{banner.text}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {banner.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {banner.showOnHomepage && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        Homepage
                      </span>
                    )}
                    {banner.showOnEnginePages.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Engine Pages
                      </span>
                    )}
                    {!banner.showOnHomepage && banner.showOnEnginePages.length === 0 && (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {banner.startDate} to {banner.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={classNames(
                        banner.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {banner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(banner)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100"
                        title="Edit Banner"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                        title="Delete Banner"
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

      {/* Banner Modal (for Add/Edit) */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingBanner.id.startsWith("new") ? "Add New Banner" : "Edit Banner"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label htmlFor="bannerText" className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
                <textarea
                  id="bannerText"
                  value={editingBanner.text}
                  onChange={(e) => setEditingBanner({ ...editingBanner, text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-1">CTA Text (Optional)</label>
                  <input
                    type="text"
                    id="ctaText"
                    value={editingBanner.ctaText || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700 mb-1">CTA Link (Optional)</label>
                  <input
                    type="text"
                    id="ctaLink"
                    value={editingBanner.ctaLink || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaLink: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="bannerType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  id="bannerType"
                  value={editingBanner.type}
                  onChange={(e) => setEditingBanner({ ...editingBanner, type: e.target.value as BannerType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Top bar">Top bar</option>
                  <option value="Modal">Modal</option>
                  <option value="Engine page block">Engine page block</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={editingBanner.startDate}
                    onChange={(e) => setEditingBanner({ ...editingBanner, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={editingBanner.endDate}
                    onChange={(e) => setEditingBanner({ ...editingBanner, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700">Show on Homepage?</label>
                <input
                  type="checkbox"
                  id="showOnHomepage"
                  checked={editingBanner.showOnHomepage}
                  onChange={(e) => setEditingBanner({ ...editingBanner, showOnHomepage: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              {/* Engine Page Selection - simplified for dummy */}
              <div className="mb-4">
                <label htmlFor="enginePages" className="block text-sm font-medium text-gray-700 mb-1">Show on Specific Engine Pages (Optional)</label>
                <select
                  id="enginePages"
                  multiple
                  value={editingBanner.showOnEnginePages}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    setEditingBanner({ ...editingBanner, showOnEnginePages: selectedOptions });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24"
                >
                  <option value="all">All Engines</option>
                  <option value="eng-001">Vendor Fit Engine</option>
                  <option value="eng-002">Roadmap Generator</option>
                  <option value="eng-003">Market Analysis Tool</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={editingBanner.status}
                  onChange={(e) => setEditingBanner({ ...editingBanner, status: e.target.value as BannerStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">Background Color (Optional)</label>
                  <input
                    type="color"
                    id="backgroundColor"
                    value={editingBanner.backgroundColor || "#ffffff"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, backgroundColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">Icon/Emoji (Optional)</label>
                  <input
                    type="text"
                    id="icon"
                    value={editingBanner.icon || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, icon: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="✨ or a URL"
                  />
                </div>
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
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}