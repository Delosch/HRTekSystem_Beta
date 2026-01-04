import { InvoiceTemplate } from "~/components/InvoiceTemplate";

export default function InvoiceDemo() {
    // Sample invoice data
    const sampleInvoice = {
        invoiceNumber: "INV-2025-001",
        invoiceDate: "2025-12-26",
        dueDate: "2026-01-25",
        companyName: "Tech Innovations Pvt Ltd",
        companyAddress: "123 Business Park, Sector 62, Noida - 201301, Uttar Pradesh, India",
        companyGSTIN: "09AABCT1234F1Z5",
        items: [
            {
                engineName: "HR Technology Maturity Analysis",
                price: 15000,
                description: "Comprehensive assessment of current HR technology infrastructure, digital readiness evaluation, and maturity scoring across key HR domains"
            },
            {
                engineName: "HR Transformation Roadmap Generator",
                price: 18000,
                description: "Strategic roadmap development with phased implementation plan, technology recommendations, and change management strategy"
            },
            {
                engineName: "Cognitive HCM Vendor Fit",
                price: 12000,
                description: "Vendor evaluation framework, RFP support, and technology fit analysis for HCM platform selection"
            }
        ],
        subtotal: 45000,
        gstAmount: 8100,
        totalAmount: 53100,
        paymentMethod: "Bank Transfer"
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Template Demo</h1>
                    <p className="text-gray-600">Preview of HRTekSystem Invoice</p>
                    <div className="mt-4 flex gap-3 justify-center">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Print / Save as PDF
                        </button>
                        <a
                            href="/dashboard"
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                        >
                            Back to Dashboard
                        </a>
                    </div>
                </div>

                <InvoiceTemplate {...sampleInvoice} />
            </div>
        </div>
    );
}
