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
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-none overflow-hidden print:shadow-none print:border-none border border-gray-100 flex flex-col min-h-[1100px] print:min-h-0 print:w-full">
            {/* Header Section - Inspired by Landing Page Navbar */}
            <div className="bg-[#000033] p-10 md:p-14 text-white relative overflow-hidden">
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 flex items-center justify-center">
                            <img
                                src="/logo_icon_final.png"
                                alt="HR-TEK"
                                className="h-full w-auto object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-4xl font-black tracking-tighter leading-none mb-1">
                                <span className="text-white">HR-TEK</span>{" "}
                                <span className="text-[#00B5E2]">SYSTEM</span>
                            </h1>
                            <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em]">
                                Intelligent HR Transformation
                            </p>

                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="bg-[#00B5E2] text-[#000033] px-6 py-2 rounded-full mb-6 shadow-[0_0_30px_rgba(0,181,226,0.2)]">
                            <p className="text-xs font-black uppercase tracking-widest">Official Receipt</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Invoice Reference</p>
                                <p className="text-2xl font-black tracking-tighter">{invoiceNumber}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Issuance</p>
                                <p className="text-2xl font-black tracking-tighter">{formatDate(invoiceDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Content */}
            <div className="p-10 md:p-14 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                    {/* Bill From - Static Corporate Data */}
                    <div className="space-y-5">
                        <h3 className="text-[11px] font-black text-[#000033] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="w-5 h-[2px] bg-[#00B5E2]" />
                            From / Origin
                        </h3>
                        <div className="space-y-2">
                            <p className="font-black text-slate-900 text-lg tracking-tight">HR-Tek System</p>
                            <div className="text-slate-500 text-[13px] font-medium leading-relaxed space-y-0.5">
                                <p>Plot No. 14-15, Madhusudan Colony</p>
                                <p>IIM Road, Lucknow - 226013</p>
                                <p>Uttar Pradesh, India</p>
                            </div>
                            <div className="mt-6 space-y-1.5 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase w-12">GSTIN</span>
                                    <span className="text-xs font-bold text-slate-700">09AANCP9887E1ZJ</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase w-12">Email</span>
                                    <span className="text-xs font-bold text-slate-700">support@hr-teksystem.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To - Dynamic Client Data */}
                    <div className="space-y-5">
                        <h3 className="text-[11px] font-black text-[#000033] uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="w-5 h-[2px] bg-[#00B5E2]" />
                            Recipient / Bill To
                        </h3>
                        <div className="space-y-2">
                            <p className="font-extrabold text-slate-900 text-2xl tracking-tighter">{companyName}</p>
                            {companyAddress ? (
                                <p className="text-slate-500 text-[13px] font-medium leading-relaxed">{companyAddress}</p>
                            ) : (
                                <p className="text-slate-300 italic text-xs">Full billing address not provided</p>
                            )}

                            {companyGSTIN && (
                                <div className="mt-4 inline-flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tax Identity</span>
                                    <span className="text-xs font-black text-slate-800 tracking-wider">{companyGSTIN}</span>
                                </div>
                            )}

                            <div className="mt-8 bg-[#000033]/5 p-5 rounded-2xl border border-[#000033]/5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Channel</p>
                                    <p className="text-sm font-black text-[#000033]">{getPaymentModeLabel(paymentMethod)}</p>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-200" />
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Currency</p>
                                    <p className="text-sm font-black text-slate-800">INR (₹)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Ledger Table */}
                <div className="mb-16 border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm bg-white relative">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#000033] text-white">
                                <th className="p-6 text-left text-[10px] font-black uppercase tracking-[0.2em] pl-10">Ref</th>
                                <th className="p-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Service Description</th>
                                <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">HSN Code</th>
                                <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em] pr-10 whitespace-nowrap">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {items.map((item, index) => (
                                <tr key={index} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="p-8 text-slate-400 font-bold pl-10">#0{index + 1}</td>
                                    <td className="p-8">
                                        <p className="text-base font-black text-slate-900 group-hover:text-[#000033] transition-colors">{item.engineName}</p>
                                        <p className="text-xs text-slate-500 mt-2 font-medium max-w-sm leading-relaxed">{item.description}</p>
                                    </td>
                                    <td className="p-8 text-right font-mono text-xs font-bold text-slate-400">{item.hsnCode || '998311'}</td>
                                    <td className="p-8 text-right pr-10">
                                        <span className="text-base font-black text-slate-900">{formatCurrency(item.price)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-100">
                                <td colSpan={2} />
                                <td className="p-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Sub-Total</td>
                                <td className="p-6 text-right pr-10 font-bold text-slate-700">{formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td colSpan={2} />
                                <td className="p-2 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Tax (GST 18%)</td>
                                <td className="p-2 text-right pr-10 font-bold text-slate-700">{formatCurrency(gstAmount)}</td>
                            </tr>
                            <tr className="bg-[#000033] text-white">
                                <td colSpan={2} className="p-8 pl-10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 bg-[#00B5E2] rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Finalized Balance</p>
                                    </div>
                                </td>
                                <td className="p-8 text-right text-xs font-bold uppercase tracking-widest">Total Liability</td>
                                <td className="p-8 text-right pr-10 font-black text-3xl tracking-tighter text-[#00B5E2]">
                                    {formatCurrency(totalAmount)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer Section - Instructions & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Bank & Payment */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                            <svg className="w-4 h-4 text-[#00B5E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Payment Directives
                        </h4>
                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-8">
                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bank Remittance</p>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900">State Bank of India</p>
                                    <p className="text-xs font-bold text-[#00B5E2]">IFSC Code: SBIN0010175</p>
                                    <p className="text-base font-black text-slate-800 tracking-widest mt-2 font-mono">00000020532076408</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-200/50 space-y-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instant Settlement (UPI)</p>
                                <p className="text-xs font-black text-slate-700 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] tracking-tighter">VPA</span>
                                    hrteksystems@sbi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Legal & Footer Notes */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                            <svg className="w-4 h-4 text-[#00B5E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Legal Annotations
                        </h4>
                        <div className="space-y-6">
                            <ul className="space-y-4">
                                {[
                                    'Service access is activated immediately upon successful payment verification.',
                                    'This invoice is a final record of the transaction.',
                                    'Disputes should be addressed through official support channels.',
                                    'All digital products are non-refundable once unlocked.'
                                ].map((note, i) => (
                                    <li key={i} className="flex gap-4 items-start text-[11px] font-medium text-slate-500 leading-relaxed">
                                        <span className="text-indigo-400 font-black mt-0.5">•</span>
                                        {note}
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-8 border-t border-slate-100 flex flex-col gap-2">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Support Inquiries</p>
                                <p className="text-[11px] font-bold text-slate-400">EMAIL / support@hr-teksystem.com</p>
                                <p className="text-[11px] font-bold text-slate-400">TEL / +91 93358 70619</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Global Footer */}
            <div className="mt-auto border-t border-slate-100 bg-slate-50 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Integrated Financial System • Verified Output</p>
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    HR-TEK SYSTEM • LUCKNOW • INDIA
                </div>
            </div>
        </div>
    );
};
