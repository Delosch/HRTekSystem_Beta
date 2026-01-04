// app/routes/admin.website.branding.tsx
import { PaintBrushIcon } from "@heroicons/react/24/outline"; // FontSansIcon is a placeholder

export default function BrandAssetsPage() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-center py-20">
      <PaintBrushIcon className="mx-auto h-20 w-20 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Brand Assets</h2>
      <p className="text-gray-600 mb-4">
        This section is planned for **Phase 2**. It will allow you to upload and manage company-wide
        logos, define font preferences, and reference your brand color palette.
      </p>
      <p className="text-gray-500 text-sm">
        This ensures consistent branding across your website and digital assets.
      </p>
      <div className="mt-8 flex justify-center space-x-4">
        {/* Placeholder for future actions */}
        <a
          href="#"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 opacity-75 cursor-not-allowed"
        >
          Coming Soon
        </a>
      </div>
    </div>
  );
}
