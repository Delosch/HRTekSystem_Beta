import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentMagnifyingGlassIcon
} from "@heroicons/react/24/outline";

// Dummy Data (replace with actual data fetching)
type SubmissionStatus = "Awaiting AI" | "Awaiting Admin Review" | "Completed";

interface Submission {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  submittedBy: string;
}

interface Engine {
  id: string;
  name: string;
  submissions: Submission[];
}

const enginesData: Record<string, Engine[]> = {
  "org-101": [
    {
      id: "eng-001",
      name: "Vendor Fit Engine",
      submissions: [
        { id: "sub-001", submittedAt: "2025-07-24 10:30 AM", status: "Completed", submittedBy: "Alice Johnson" },
        { id: "sub-002", submittedAt: "2025-07-23 03:15 PM", status: "Awaiting Admin Review", submittedBy: "Bob Smith" },
        { id: "sub-003", submittedAt: "2025-07-22 11:00 AM", status: "Awaiting AI", submittedBy: "Charlie Brown" },
      ],
    },
    {
      id: "eng-002",
      name: "Roadmap Generator",
      submissions: [
        { id: "sub-004", submittedAt: "2025-07-25 09:00 AM", status: "Completed", submittedBy: "Alice Johnson" },
        { id: "sub-005", submittedAt: "2025-07-21 02:00 PM", status: "Awaiting Admin Review", submittedBy: "Bob Smith" },
      ],
    },
  ],
  "org-102": [
    {
      id: "eng-003",
      name: "Market Analysis Tool",
      submissions: [
        { id: "sub-006", submittedAt: "2025-07-26 10:00 AM", status: "Awaiting AI", submittedBy: "Eve Green" },
      ],
    },
  ],
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const orgId = "org-101";
  const engines = enginesData[orgId || ""] || [];
  return json({ engines });
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CompanyEnginesPage() {
  const { engines } = useLoaderData<typeof loader>();
  const [openEngineId, setOpenEngineId] = useState<string | null>(null);

  const toggleAccordion = (engineId: string) => {
    setOpenEngineId(openEngineId === engineId ? null : engineId);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-5">Response Sheets</h2>

      {engines.length === 0 ? (
        <p className="text-gray-600">No engines found for this company.</p>
      ) : (
        <div className="space-y-4">
          {engines.map((engine) => (
            <div key={engine.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                className="flex items-center justify-between w-full px-5 py-3 bg-gray-50 text-left text-lg font-medium text-gray-800 hover:bg-gray-100 focus:outline-none"
                onClick={() => toggleAccordion(engine.id)}
              >
                <span>{engine.name} ({engine.submissions.length} submissions)</span>
                {openEngineId === engine.id ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {openEngineId === engine.id && (
                <div className="p-5 border-t border-gray-200">
                  {engine.submissions.length === 0 ? (
                    <p className="text-gray-600 text-sm">No submissions for this engine yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {engine.submissions.map((submission) => (
                            <tr key={submission.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {submission.submittedBy}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {submission.submittedAt}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={classNames(
                                    submission.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : submission.status === "Awaiting Admin Review"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800",
                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                  )}
                                >
                                  {submission.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                  title="View Full Submission"
                                >
                                  <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-1" /> View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}