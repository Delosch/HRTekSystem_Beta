import React from 'react';

interface InvoiceItem {
    engineName: string;
    price: number;
    description: string;
    hsnCode?: string;
}

interface InvoiceTemplateProps {
    invoiceLabel?: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    companyName: string;
    companyAddress?: string;
    companyGSTIN?: string;
    billingContact?: {
        name: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    gstAmount: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    totalAmount: number;
    paymentMethod?: string;
    hsnCode?: string;
    paymentType?: string;
    paidAmount?: number;
    balanceDue?: number;
    installments?: Array<{
        installmentNumber: number;
        percentage: number;
        amount?: number;
        dueDate?: string;
        splitDetails?: Array<{
            item: string;
            description: string;
            amount: string;
            hsnCode?: string;
        }>;
        status?: string;
    }>;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
    invoiceLabel = "Invoice",
    invoiceNumber,
    invoiceDate,
    dueDate,
    companyName,
    companyAddress,
    companyGSTIN,
    billingContact,
    items,
    subtotal,
    gstAmount,
    totalAmount,
    paymentMethod,
    hsnCode,
    cgst,
    sgst,
    igst,
    paymentType,
    paidAmount,
    balanceDue,
    installments
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

    const paidInstallments = installments?.filter(inst => inst.status?.toLowerCase() === 'paid') ?? [];
    const unpaidInstallments = installments?.filter(inst => inst.status?.toLowerCase() !== 'paid') ?? [];
    const displayInstallments = installments ?? [];
    const hasInstallments = displayInstallments.length > 0;

    // Calculate Amount Paid and Balance Due based on installment statuses:
    // - With installments: Amount Paid = sum of paid installments, Balance Due = sum of unpaid installments
    // - Without installments (full payment): both are 0
    const calculatedPaidAmount = hasInstallments
        ? paidInstallments.reduce((sum, inst) => sum + (inst.amount ?? Math.round((totalAmount * inst.percentage) / 100)), 0)
        : 0;

    // Detect the current installment number from the invoice item name (e.g. "Engine - Installment #2")
    const firstItemName = items?.[0]?.engineName || '';
    const instMatch = firstItemName.match(/- Installment #(\d+)$/);
    const currentInstallmentNumber = instMatch ? parseInt(instMatch[1], 10) : 0;

    const calculatedBalanceDue = hasInstallments
        ? (currentInstallmentNumber > 0
            ? displayInstallments
                .filter(inst => inst.installmentNumber > currentInstallmentNumber)
                .reduce((sum, inst) => sum + (inst.amount ?? Math.round((totalAmount * inst.percentage) / 100)), 0)
            : unpaidInstallments.reduce((sum, inst) => sum + (inst.amount ?? Math.round((totalAmount * inst.percentage) / 100)), 0))
        : 0;

    // Total Paid = amount of the CURRENT installment being invoiced
    const currentInstallment = displayInstallments.find(inst => inst.installmentNumber === currentInstallmentNumber);
    const currentInstallmentAmount = currentInstallment
        ? (currentInstallment.amount ?? Math.round((totalAmount * currentInstallment.percentage) / 100))
        : 0;

    // Advance Paid = sum of all PREVIOUS installments (installments before the current one)
    const advancePaidAmount = hasInstallments && currentInstallmentNumber > 1
        ? displayInstallments
            .filter(inst => inst.installmentNumber < currentInstallmentNumber)
            .reduce((sum, inst) => sum + (inst.amount ?? Math.round((totalAmount * inst.percentage) / 100)), 0)
        : 0;

    const displayPaidAmount = hasInstallments && currentInstallmentNumber > 0
        ? currentInstallmentAmount
        : (paidAmount !== undefined ? paidAmount : calculatedPaidAmount);

    const displayBalanceDue = hasInstallments && currentInstallmentNumber > 0
        ? calculatedBalanceDue
        : (balanceDue !== undefined ? balanceDue : calculatedBalanceDue);

    const fallbackTaxAmount = typeof gstAmount === 'number' && gstAmount > 0 ? Math.round(gstAmount / 2) : Math.round(subtotal * 0.09);
    const cgstAmount = typeof cgst === 'number' && cgst > 0 ? cgst : fallbackTaxAmount;
    const sgstAmount = typeof sgst === 'number' && sgst > 0 ? sgst : fallbackTaxAmount;

    const grandTotalOfInstallments = hasInstallments
        ? displayInstallments.reduce((sum, inst) => sum + (inst.amount ?? Math.round((totalAmount * inst.percentage) / 100)), 0)
        : (totalAmount > 0 ? totalAmount : subtotal + (cgstAmount + sgstAmount));
    const totalTaxAmount = cgstAmount + sgstAmount;
    const invoiceTotalAmount = totalAmount > 0 ? totalAmount : subtotal + totalTaxAmount;

    return (
        <div className="max-w-5xl mx-auto bg-white border border-slate-400 shadow-sm print:shadow-none print:border print:border-slate-400 text-slate-900">
            <div className="px-8 py-6 print:px-6 print:py-4">
                <div className="flex flex-col xl:flex-row justify-between gap-8 pb-6 border-b border-slate-300">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                <img src="/logo_icon_final.png" alt="HR-TEK" className="h-full w-auto" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Issuer</p>
                                <h1 className="text-2xl font-black text-slate-900">HR-TEK SYSTEM</h1>
                            </div>
                        </div>
                        <div className="space-y-1 text-sm font-medium text-slate-600 leading-relaxed">
                            <p>Plot No. 14-15, Madhupuram</p>
                            <p>IIM Road, Lucknow - 226013</p>
                            <p>Uttar Pradesh, India</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 pt-4">
                            <div>
                                <p className="text-slate-800">GSTIN</p>
                                <p className="text-slate-900">09AANCP9887E1ZJ</p>
                            </div>
                        </div>
                        <div className="pt-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Email</p>
                            <p className="text-[11px] font-bold text-slate-900 normal-case tracking-normal">support@hrteksystem.com</p>
                        </div>
                    </div>
                    <div className="self-start text-right">
                        <div className="inline-flex items-center justify-between gap-3 bg-slate-100 border border-slate-300 px-5 py-3 rounded-3xl">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{invoiceLabel}</p>
                                <p className="text-xl font-black text-slate-900 leading-none mt-2 whitespace-nowrap">{invoiceNumber}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Invoice Date</p>
                                <p className="font-semibold text-slate-900">{formatDate(invoiceDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Due Date</p>
                                <p className="font-semibold text-slate-900">{formatDate(dueDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
                    <div className="rounded-3xl border border-slate-300 bg-slate-50 p-6 space-y-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Bill To</p>
                        <p className="text-lg font-black text-slate-900">{billingContact?.name || companyName}</p>
                        {billingContact ? (
                            <>
                                {billingContact.address && (
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{billingContact.address}</p>
                                )}
                                {(billingContact.city || billingContact.state || billingContact.pincode) && (
                                    <p className="text-sm text-slate-600">
                                        {[billingContact.city, billingContact.state, billingContact.pincode].filter(Boolean).join(', ')}
                                    </p>
                                )}
                                <div className="pt-3 border-t border-slate-300 space-y-2">
                                    {billingContact.email && (
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Email</p>
                                            <p className="text-sm text-slate-900 font-semibold">{billingContact.email}</p>
                                        </div>
                                    )}
                                    {billingContact.phone && (
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Phone</p>
                                            <p className="text-sm text-slate-900 font-semibold">+91 {billingContact.phone}</p>
                                        </div>
                                    )}
                                    {(billingContact.gstin || companyGSTIN) && (
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">GSTIN</p>
                                            <p className="text-sm text-slate-900 font-semibold">{billingContact.gstin || companyGSTIN}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {companyAddress ? (
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{companyAddress}</p>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Billing address not provided</p>
                                )}
                                {companyGSTIN && (
                                    <div className="pt-3 border-t border-slate-300">
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">GSTIN</p>
                                        <p className="text-sm text-slate-900 font-semibold">{companyGSTIN}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="rounded-3xl border border-slate-300 bg-slate-50 p-6 space-y-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Payment Details</p>
                        <div className="text-sm text-slate-600 space-y-2">
                            <div className="flex justify-between gap-2">
                                <span>Payment Mode</span>
                                <span className="font-semibold text-slate-900">{getPaymentModeLabel(paymentMethod)}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span>Invoice Type</span>
                                <span className="font-semibold text-slate-900">{invoiceLabel}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span>Currency</span>
                                <span className="font-semibold text-slate-900">INR</span>
                            </div>
                            <div className="flex justify-between gap-2 border-t border-slate-200 pt-2">
                                <span>Grand Total</span>
                                <span className="font-bold text-slate-900">{formatCurrency(grandTotalOfInstallments)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {displayInstallments.length > 0 && (
                    <div className="mb-10 print:break-inside-auto" style={{ breakInside: 'auto', pageBreakInside: 'auto' }}>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 print:break-inside-auto" style={{ breakInside: 'auto', pageBreakInside: 'auto' }}>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Installment Breakdown</h3>
                            <div className="space-y-4 text-sm text-slate-700">
                                {displayInstallments.map((inst, idx) => {
                                    const calculatedAmount = inst.amount ?? Math.round((totalAmount * inst.percentage) / 100);
                                    return (
                                        <div key={idx} className={`rounded-2xl border p-4 print:break-inside-avoid ${inst.status?.toLowerCase() === 'paid' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-white'}`} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Installment {inst.installmentNumber}</p>
                                                    <p className="text-xs text-slate-500">{inst.percentage}% of total</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(calculatedAmount)}</p>
                                                    {inst.dueDate && <p className="text-xs text-slate-500">Due by {formatDate(inst.dueDate)}</p>}
                                                </div>
                                            </div>
                                            <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                                inst.status?.toLowerCase() === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : inst.status?.toLowerCase() === 'payment_submitted'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : inst.status?.toLowerCase() === 'rejected'
                                                            ? 'bg-rose-100 text-rose-800'
                                                            : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {inst.status?.toLowerCase() === 'paid' && '✅ Paid'}
                                                {inst.status?.toLowerCase() === 'payment_submitted' && '⏳ Proof Submitted'}
                                                {inst.status?.toLowerCase() === 'rejected' && '❌ Rejected'}
                                                {(!inst.status || inst.status?.toLowerCase() === 'unpaid') && '🔒 Unpaid'}
                                                {inst.status && !['paid', 'payment_submitted', 'rejected', 'unpaid'].includes(inst.status.toLowerCase()) && inst.status.replace(/_/g, ' ')}
                                            </div>
                                            {inst.splitDetails && inst.splitDetails.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Split Details</p>
                                                    <div className="grid gap-3">
                                                        {inst.splitDetails.map((split, splitIdx) => (
                                                            <div key={splitIdx} className="rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm">
                                                                <div className="flex justify-between gap-3">

                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-semibold text-slate-900">{split.description || split.item}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            {split.item && (
                                                                                <p className="text-xs text-slate-500">{split.item}</p>
                                                                            )}
                                                                            {split.hsnCode && (
                                                                                <p className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">HSN: {split.hsnCode}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="font-semibold text-slate-900">{split.amount}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto mb-10">
                    <table className="min-w-full border-collapse text-sm border border-slate-300">
                        <thead>
                            <tr className="bg-slate-100 text-left text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                                <th className="px-4 py-4">S.No</th>
                                <th className="px-4 py-4">Item & Description</th>
                                <th className="px-4 py-4 text-right">HSN</th>
                                <th className="px-4 py-4 text-right">Qty</th>
                                <th className="px-4 py-4 text-right">Rate</th>
                                <th className="px-4 py-4 text-right">Tax Rate</th>
                                <th className="px-4 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {items.filter(item => !(item.price === 0 && (item.description || "").includes("Included Core Engine"))).map((item, index) => (
                                <tr key={index} className="bg-white">
                                    <td className="px-4 py-5 align-top text-slate-500 font-semibold">{index + 1}</td>
                                    <td className="px-4 py-5 align-top">
                                        <div className="font-black text-slate-900">{item.engineName}</div>
                                        <div className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</div>
                                        {(item.hsnCode || hsnCode) && (
                                            <div className="text-xs text-slate-500 mt-1">HSN Code: {item.hsnCode || hsnCode}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-5 align-top text-right font-semibold text-slate-900">{item.hsnCode || hsnCode || ''}</td>
                                    <td className="px-4 py-5 align-top text-right font-semibold text-slate-900">1</td>
                                    <td className="px-4 py-5 align-top text-right font-semibold text-slate-900">{formatCurrency(item.price)}</td>
                                    <td className="px-4 py-5 align-top text-right font-semibold text-slate-900">18%</td>
                                    <td className="px-4 py-5 align-top text-right font-black text-slate-900">{formatCurrency(item.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="rounded-3xl border border-slate-300 bg-slate-50 p-6 space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Bank Details</h3>
                        <div className="space-y-2 text-sm text-slate-700">
                            <p className="font-bold">State Bank of India</p>
                            <p>Account Name: HR-TEK SYSTEM</p>
                            <p>Account No: 00000020532076408</p>
                            <p>IFSC: SBIN0010175</p>
                            <p>Branch: Lucknow</p>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-slate-300 bg-slate-50 p-6 space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Total Summary</h3>
                        <div className="space-y-3 text-sm text-slate-700">
                            <div className="flex justify-between">
                                <span>Sub Total</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CGST (9%)</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(cgstAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>SGST (9%)</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(sgstAmount)}</span>
                            </div>
                            {hasInstallments && currentInstallmentNumber > 0 && (
                                <>
                                    <div className="flex justify-between border-t border-slate-200 pt-3">
                                        <span>Total Paid <span className="text-xs text-slate-500">(Installment #{currentInstallmentNumber})</span></span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(currentInstallmentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Advance Paid <span className="text-xs text-slate-500">(Previous Installments)</span></span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(advancePaidAmount)}</span>
                                    </div>
                                </>
                            )}
                            {(!hasInstallments || currentInstallmentNumber === 0) && (
                                <div className="flex justify-between">
                                    <span>Amount Paid</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(calculatedPaidAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Balance Due</span>
                                <span className={`font-semibold ${calculatedBalanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(calculatedBalanceDue)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-300 pt-4 text-lg font-black text-slate-900">
                                <span>Total</span>
                                <span>{formatCurrency(invoiceTotalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10 border-b border-slate-300">
                    <div className="space-y-4 text-sm text-slate-700">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Terms & Conditions</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Invoice is valid only after verification of payment proof.</li>
                            <li>Payment must be completed within 7 days of invoice date.</li>
                            <li>Disputes must be raised within 5 business days.</li>
                            <li>Refunds are not applicable once services are activated.</li>
                        </ul>
                    </div>
                    <div className="space-y-4 text-sm text-slate-700">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Authorized Signature</h3>
                        <div className="h-28 rounded-3xl border border-slate-300 bg-white flex items-center justify-center p-2">
                            <img src="/authorized-signature.png" alt="Authorized Signature - Delosch Technologies" className="h-full object-contain" />
                        </div>
                        <p className="text-xs text-slate-500">Delosch Technologies Pvt. Ltd. - Authorized Signatory</p>
                    </div>
                </div>

                <div className="pt-8 text-[11px] text-slate-500 space-y-2">
                    <p>Thank you for your business. Please retain this invoice for your records.</p>
                    <p>All services are subject to HR-TEK SYSTEM terms and conditions.</p>
                </div>
            </div>
        </div>
    );
};
