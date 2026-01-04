import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Dummy Data (replace with actual data fetching)
type PaymentStatus = "Requested" | "Pending Approval" | "Approved" | "Paid" | "Rejected";

interface InvoiceRequest {
  id: string;
  engineName: string;
  submittedBy: string;
  amount: number;
  paymentStatus: PaymentStatus;
  invoiceSent: boolean;
  requestedAt: string;
  invoicePdfUrl?: string; // Optional link to generated/uploaded invoice
}

const invoiceRequestsData: Record<string, InvoiceRequest[]> = {
  "org-101": [
    {
      id: "inv-001",
      engineName: "Vendor Fit Engine (Premium)",
      submittedBy: "Alice Johnson",
      amount: 499.00,
      paymentStatus: "Approved",
      invoiceSent: true,
      requestedAt: "2025-07-10",
      invoicePdfUrl: "/invoices/inv-001.pdf", // Placeholder
    },
    {
      id: "inv-002",
      engineName: "Roadmap Generator (Pro)",
      submittedBy: "Bob Smith",
      amount: 299.00,
      paymentStatus: "Pending Approval",
      invoiceSent: false,
      requestedAt: "2025-07-22",
    },
  ],
  "org-102": [
    {
      id: "inv-003",
      engineName: "Market Analysis Tool (Basic)",
      submittedBy: "Eve Green",
      amount: 99.00,
      paymentStatus: "Requested",
      invoiceSent: false,
      requestedAt: "2025-07-25",
    },
  ],
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const orgId = params.orgId;
  const invoiceRequests = invoiceRequestsData[orgId || ""] || [];
  return json({ invoiceRequests });
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CompanyInvoiceRequestsPage() {
  const { invoiceRequests } = useLoaderData<typeof loader>();

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-5">Invoice Requests</h2>

      {invoiceRequests.length === 0 ? (
        <p className="text-gray-600">No invoice requests found for this company.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Engine
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Submitted By
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Invoice Sent?
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoiceRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.engineName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.submittedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${request.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={classNames(
                        request.paymentStatus === "Approved" || request.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : request.paymentStatus === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800",
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {request.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {request.invoiceSent ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" title="Invoice Sent" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 mx-auto" title="Invoice Not Sent" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100 inline-flex items-center"
                        title="View Request Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span className="ml-1">View</span>
                      </button>
                      {!request.invoiceSent && request.paymentStatus !== "Rejected" && (
                        <>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-gray-100"
                            title="Upload Invoice PDF"
                          >
                            <CloudArrowUpIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-gray-100"
                            title="Mark as Paid"
                          >
                            <TagIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                            title="Reject Request"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {request.invoiceSent && request.invoicePdfUrl && (
                        <a
                          href={request.invoicePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 inline-flex items-center"
                          title="Download Invoice"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </a>
                      )}
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