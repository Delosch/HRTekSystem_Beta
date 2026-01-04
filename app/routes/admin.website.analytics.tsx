// app/routes/admin.website.analytics.tsx
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";

export default function AnalyticsDashboardPage() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-center py-20">
      <ChartBarSquareIcon className="mx-auto h-20 w-20 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Analytics Dashboard</h2>
      <p className="text-gray-600 mb-4">
        This section is planned for **Phase 2**. It will provide insights into website visitors,
        top pages, CTA click counts, and blog engagement.
      </p>
      <p className="text-gray-500 text-sm">
        Integrate with tools like Google Analytics, Mixpanel, or custom tracking solutions here.
      </p>
      <div className="mt-8 flex justify-center">
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