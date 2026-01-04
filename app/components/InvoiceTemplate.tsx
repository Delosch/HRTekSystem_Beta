import React from 'react';

interface InvoiceItem {
    engineName: string;
    price: number;
    description: string;
    hsnCode?: string;
}

interface InvoiceTemplateProps {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    companyName: string;
    companyAddress?: string;
    companyGSTIN?: string;
    items: InvoiceItem[];
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    paymentMethod?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
    invoiceNumber,
    invoiceDate,
    dueDate,
    companyName,
    companyAddress,
    companyGSTIN,
    items,
    subtotal,
    gstAmount,
    totalAmount,
    paymentMethod
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getPaymentModeLabel = (method?: string) => {
        switch (method) {
            case 'bank_transfer': return 'Bank Transfer / NEFT / RTGS';
            case 'upi': return 'UPI';
            case 'qr_code': return 'QR Code';
            default: return method || 'Not Specified';
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none">
            {/* Header with Brand Colors */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-8">
                <div className="flex justify-between items-start">
                    {/* Company Logo and Name */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white p-2 rounded-lg">
                                <img
                                    src="/logoFinal.png"
                                    alt="HRTekSystem"
                                    className="h-12 w-auto"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">HRTekSystem</h1>
                                <p className="text-blue-100 text-sm">Innovating HR with Technology</p>
                            </div>
                        </div>
                        <p className="text-blue-100 text-xs mt-2">A Brand of Delosch Technologies Private Limited</p>
                    </div>

                    {/* Invoice Title */}
                    <div className="text-right">
                        <h2 className="text-4xl font-bold mb-2">INVOICE</h2>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <p className="text-sm">Invoice #</p>
                            <p className="text-xl font-bold">{invoiceNumber}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Details Section */}
            <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Bill From */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 border-b-2 border-blue-600 pb-1">
                            From
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p className="font-bold text-gray-900">Delosch Technologies (P) Ltd.</p>
                            <p className="text-gray-700">Plot No. 14-15, Madhusudan Colony</p>
                            <p className="text-gray-700">IIM Road, Lucknow - 226013</p>
                            <p className="text-gray-700">Uttar Pradesh, India</p>
                            <div className="mt-3 space-y-1">
                                <p className="text-gray-700"><span className="font-semibold">GSTIN:</span> 09AANCP9887E1ZJ</p>
                                <p className="text-gray-700"><span className="font-semibold">Email:</span> support@hrteksystem.com</p>
                                <p className="text-gray-700"><span className="font-semibold">Website:</span> https://hrteksystem.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 border-b-2 border-blue-600 pb-1">
                            Bill To
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p className="font-bold text-gray-900 text-lg">{companyName}</p>
                            {companyAddress && <p className="text-gray-700">{companyAddress}</p>}
                            {companyGSTIN && (
                                <p className="text-gray-700 mt-2">
                                    <span className="font-semibold">GSTIN/PAN:</span> {companyGSTIN}
                                </p>
                            )}
                        </div>

                        {/* Invoice Dates */}
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Invoice Date:</span>
                                <span className="text-gray-900 font-semibold">{formatDate(invoiceDate)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                <span className="text-gray-600 font-medium">Payment Mode:</span>
                                <span className="text-blue-800 font-semibold">{getPaymentModeLabel(paymentMethod)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                                <th className="text-left p-4 font-semibold w-16">Sr.No</th>
                                <th className="text-left p-4 font-semibold">Description</th>
                                <th className="text-left p-4 font-semibold">HSN/SAC</th>
                                <th className="text-left p-4 font-semibold">Engine/Service</th>
                                <th className="text-right p-4 font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                    <td className="p-4 text-gray-700">{index + 1}</td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900">{item.engineName}</p>
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    </td>
                                    <td className="p-4 text-gray-700 font-mono text-sm">
                                        {item.hsnCode || '998311'}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                            {item.engineName}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-semibold text-gray-900">{formatCurrency(item.price)}</td>
                                </tr>
                            ))}

                            {/* Subtotal */}
                            <tr className="bg-gray-50">
                                <td colSpan={4} className="p-4 text-right font-semibold text-gray-700">Subtotal:</td>
                                <td className="p-4 text-right font-semibold text-gray-900">{formatCurrency(subtotal)}</td>
                            </tr>

                            {/* GST */}
                            <tr className="bg-gray-50">
                                <td colSpan={4} className="p-4 text-right font-semibold text-gray-700">
                                    GST (18%):
                                </td>
                                <td className="p-4 text-right font-semibold text-gray-900">{formatCurrency(gstAmount)}</td>
                            </tr>

                            {/* Total */}
                            <tr className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                                <td colSpan={4} className="p-4 text-right font-bold text-lg">Total Amount:</td>
                                <td className="p-4 text-right font-bold text-xl">{formatCurrency(totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payment Instructions */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">💳</span>
                        Payment Instructions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm text-gray-700">
                            <p className="font-semibold text-blue-800 border-b border-blue-200 pb-1 mb-2">Bank Details</p>
                            <p><span className="font-semibold">Bank Name:</span> State Bank of India - IIM Branch Lucknow</p>
                            <p><span className="font-semibold">Account Name:</span> Delosch Technologies (P) Ltd.</p>
                            <p><span className="font-semibold">Account Number:</span> 00000020532076408</p>
                            <p><span className="font-semibold">IFSC Code:</span> SBIN0010175</p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p className="font-semibold text-blue-800 border-b border-blue-200 pb-1 mb-2">UPI Payment</p>
                            <p><span className="font-semibold">UPI ID:</span> deloschtechnologiesprivatelimited@sbi</p>
                            <p className="text-xs text-gray-500 mt-1">Scan QR code or use VPA for instant payment</p>
                        </div>
                    </div>
                    <p className="text-red-600 font-semibold mt-4 text-sm">⚠️ Payments are due by the last day of the month.</p>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="font-bold text-gray-900 mb-3">Terms & Conditions:</h3>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Payment is due within 30 days of invoice date</li>
                        <li>Late payments may incur additional charges</li>
                        <li>All services are subject to HRTekSystem's standard terms of service</li>
                        <li>Please quote invoice number in all payment communications</li>
                        <li>For any queries, contact support@hrteksystem.com</li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
                    <p className="text-sm text-gray-600 mb-2">Thank you for your business!</p>
                    <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
                        <span>📧 support@hrteksystem.com</span>
                        <span>•</span>
                        <span>🌐 https://hrteksystem.com</span>
                        <span>•</span>
                        <span>📍 Lucknow, India</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        This is a computer-generated invoice and does not require a signature
                    </p>
                </div>
            </div>

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <p className="text-9xl font-bold text-gray-400 rotate-45">HRTekSystem</p>
            </div>
        </div>
    );
};
