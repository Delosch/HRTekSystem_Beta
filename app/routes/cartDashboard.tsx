import { useState, useEffect, useMemo } from "react";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { LoaderFunction, ActionFunction, redirect, json } from "@remix-run/node";
import { Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CreditCardIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

import Sidebar from "../components/DashboardComponents/Sidebar";
import { getCartItems, deleteCartItem } from "~/models/cart.model.server";
import { acceptInvoice, declineInvoice } from "~/models/payment.model.server";
import { requireUserSession } from "~/lib/session.server";
import { getEnhancedUser } from "~/utils/user.server";
import { calculatePricing, type EngineType } from "~/services/pricing.server";

interface CartItem {
  pk: string;
  sk: 'CART';
  productName: string;
  price: number;
  addedBy: string;
  addedAt: string;
}

interface EnginePaymentInfo {
  status: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
}

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const user = await getEnhancedUser(request);
  if (!user.organisationId) {
    return redirect('/auth');
  }

  const { getCompanyProfile } = await import("~/models/company.model.server");
  const { getCompanyPayments } = await import("~/models/payment.model.server");

  const items = await getCartItems(user.organisationId || "");
  const companyProfile = await getCompanyProfile(user.organisationId || "");
  const allPayments = await getCompanyPayments(user.organisationId || "");

  const employeeCount = typeof companyProfile?.employee_count === 'number'
    ? companyProfile.employee_count
    : parseInt(companyProfile?.employee_count || "500");

  // Map product names to pricing engine types
  const engineTypeMap: Record<string, EngineType> = {
    "HCM Vendor Fit Engine": "hcm-vendor-fit",
    "HR Technology Maturity Analysis": "ai-maturity",
    "Digital Maturity Assessment": "ai-maturity",
    "HR AI Based Digital Maturity": "ai-maturity",
    "AI Driven Maturity Engine": "ai-maturity",
    "HR Transformation Roadmap Generator": "roadmap",
    "Intelligent Change Management": "icms",
    "Shared Service Designer": "shared-services",
    "Shared Services Designer": "shared-services",
    "SSC/COE Shared Service Planner": "shared-services",
    "HTI - HR Transformation Intelligence": "hti",
  };

  const enrichedItems = items.map((item: any) => {
    const engineType = engineTypeMap[item.productName];
    if (engineType) {
      // Use the employee count stored at assessment time (from employee size modal),
      // falling back to company profile only if not stored.
      const empCount = item.employeeCount && item.employeeCount > 0 ? item.employeeCount : employeeCount;
      const pricing = calculatePricing({ engine: engineType, employeeCount: empCount });
      // Always use the stored price — it was calculated from the employee modal selection.
      // Recalculate only if no price was stored (legacy items).
      const price = item.price && item.price > 0 ? item.price : pricing.basePrice;
      return { ...item, price, perUserPrice: pricing.perUserPrice, tierLabel: pricing.employeeTier };
    }
    return { ...item, price: item.price || 0, perUserPrice: 0, tierLabel: "" };
  });

  // Build engine payment status map — highest priority status wins
  const statusPriority: Record<string, number> = {
    payment_verified: 6,
    completed: 6,
    payment_approved: 5,
    payment_submitted: 4,
    pending_payment: 3,
    payment_rejected: 1,
  };

  const enginePaymentMap: Record<string, EnginePaymentInfo> = {};
  for (const payment of allPayments) {
    for (const item of (payment.items || [])) {
      const key = item.engineName?.trim();
      if (!key) continue;
      const existing = enginePaymentMap[key];
      const currentPri = statusPriority[payment.status] || 0;
      const existingPri = existing ? (statusPriority[existing.status] || 0) : -1;
      if (currentPri > existingPri) {
        enginePaymentMap[key] = {
          status: payment.status,
          invoiceId: payment.invoiceId,
          invoiceNumber: payment.invoiceNumber,
          amount: item.price,
        };
      }
    }
  }

  return json({ items: enrichedItems, user, enginePaymentMap });
};

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  const user = await requireUserSession(request);
  if (!user) return redirect('/auth');

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "removeItem") {
    const pk = formData.get("pk") as string;
    const sk = formData.get("sk") as string;
    if (!pk || !sk) return json({ error: "Missing item identifiers" }, { status: 400 });
    await deleteCartItem(pk, sk);
    return json({ success: true });
  }

  if (intent === "acceptInvoice") {
    const invoiceId = formData.get("invoiceId") as string;
    if (!invoiceId) return json({ error: "Missing invoice ID" }, { status: 400 });
    await acceptInvoice(invoiceId, user.organisationId || "", user.userId);
    return json({ success: true, message: "Invoice accepted and finalized." });
  }

  if (intent === "rejectInvoice") {
    const invoiceId = formData.get("invoiceId") as string;
    const rejectReason = formData.get("rejectReason") as string;
    if (!invoiceId) return json({ error: "Missing invoice ID" }, { status: 400 });
    await declineInvoice(invoiceId, user.organisationId || "", user.userId, rejectReason || undefined);
    return json({ success: true, message: "Invoice declined. Please contact support for next steps." });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

// --- PAYMENT STATUS CONFIG ---

const paymentStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string; dot: string }> = {
  payment_verified: {
    label: "Paid & Verified",
    icon: ShieldCheckIcon,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Paid & Verified",
    icon: ShieldCheckIcon,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  payment_approved: {
    label: "Awaiting Acceptance",
    icon: ClockIcon,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  payment_submitted: {
    label: "Pending Verification",
    icon: ClockIcon,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  pending_payment: {
    label: "Invoice Created",
    icon: BanknotesIcon,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  payment_rejected: {
    label: "Payment Rejected",
    icon: XCircleIcon,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const cfg = paymentStatusConfig[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${status === "payment_submitted" || status === "pending_payment" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
};

// --- UI COMPONENTS ---

const OrderSummary = ({ subtotal, gst, total, hasUnpaidItems }: { subtotal: number; gst: number; total: number; hasUnpaidItems: boolean }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 h-fit">
    <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Order Summary</h3>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">GST (18%)</span>
        <span className="font-medium text-gray-900">₹{gst.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-base font-semibold border-t pt-3 mt-3">
        <span className="text-gray-900">Total</span>
        <span className="text-blue-600 font-bold text-lg">₹{total.toLocaleString()}</span>
      </div>
    </div>
    {hasUnpaidItems ? (
      <Link
        to="/payment/checkout"
        className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 block text-center"
      >
        Proceed to Payment
      </Link>
    ) : (
      <div className="mt-6 w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold px-6 py-3 rounded-lg text-center text-sm flex items-center justify-center gap-2">
        <CheckCircleIcon className="h-4 w-4" />
        All items have payments
      </div>
    )}
  </div>
);

const getEngineIcon = (productName: string) => {
  const icons: Record<string, string> = {
    "Intelligent Change Management": "🔄",
    "HR Transformation Roadmap": "🗺️",
    "HR Transformation Roadmap Generator": "🗺️",
    "Shared Service Designer": "🏢",
    "Shared Services Designer": "🏢",
    "SSC/COE Shared Service Planner": "🏢",
    "HR Technology Maturity Analysis": "📊",
    "HR Technology Maturity Assessment": "📊",
    "HCM Vendor Fit Engine": "🎯",
    "Digital Maturity Assessment": "📈",
    "HR Digital Transformation": "🚀",
  };
  return icons[productName] || "📦";
};

const CartItemRow = ({ item, paymentInfo }: { item: any; paymentInfo?: EnginePaymentInfo }) => {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state === 'submitting';
  const gst = Math.round(item.price * 0.18);
  const total = item.price + gst;
  const isPaid = paymentInfo?.status === "payment_verified" || paymentInfo?.status === "completed";

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      window.location.reload();
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <div className={`border-b pb-5 transition-opacity last:border-b-0 ${isDeleting ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-grow">
          <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-sm border ${isPaid ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"}`}>
            {getEngineIcon(item.productName)}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-gray-800 leading-tight">{item.productName}</h3>
              {paymentInfo && <PaymentStatusBadge status={paymentInfo.status} />}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Added {new Date(item.addedAt).toLocaleDateString()}</p>
            {item.tierLabel && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {item.tierLabel}
                </span>
                {item.perUserPrice > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">₹{item.perUserPrice.toLocaleString()}/employee</span>
                )}
              </div>
            )}
            {paymentInfo && (
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                Invoice: {paymentInfo.invoiceNumber}
              </p>
            )}
          </div>
        </div>
        <fetcher.Form method="post" className="flex-shrink-0">
          <input type="hidden" name="intent" value="removeItem" />
          <input type="hidden" name="pk" value={item.pk} />
          <input type="hidden" name="sk" value={item.sk} />
          <button
            type="submit"
            disabled={isDeleting}
            className="text-red-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed transition mt-1"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </fetcher.Form>
      </div>

      <div className="mt-3 flex items-end justify-end gap-6">
        <div className="text-right space-y-0.5">
          <div className="flex justify-between gap-8 text-xs text-gray-500">
            <span>Base price</span>
            <span className="font-medium text-gray-700">₹{item.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-8 text-xs text-gray-500">
            <span>GST (18%)</span>
            <span className="font-medium text-gray-700">₹{gst.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-8 text-sm font-bold border-t border-gray-100 pt-1 mt-1">
            <span className="text-gray-700">Total</span>
            <span className={isPaid ? "text-emerald-600" : "text-blue-600"}>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action hint based on payment status */}
      {paymentInfo?.status === "pending_payment" && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-medium text-amber-700">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          Invoice created — please upload your payment proof to complete the process.
          <Link to={`/payment/invoice/${paymentInfo.invoiceId}`} className="ml-auto font-bold underline flex items-center gap-1 hover:text-amber-900">
            Upload Proof <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          </Link>
        </div>
      )}
      {paymentInfo?.status === "payment_submitted" && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-medium text-indigo-700">
          <ClockIcon className="h-4 w-4 flex-shrink-0" />
          Payment proof submitted — awaiting admin verification. You'll be notified once approved.
        </div>
      )}
      {paymentInfo?.status === "payment_verified" || paymentInfo?.status === "completed" ? (
        <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-700">
          <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" />
          Payment verified. This engine is fully activated for your account.
        </div>
      ) : null}
      {paymentInfo?.status === "payment_rejected" && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-medium text-rose-700">
          <XCircleIcon className="h-4 w-4 flex-shrink-0" />
          Payment was rejected. Please re-submit with a valid proof.
          <Link to="/payment/checkout" className="ml-auto font-bold underline flex items-center gap-1 hover:text-rose-900">
            Retry <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          </Link>
        </div>
      )}

      {paymentInfo?.status === "payment_approved" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <fetcher.Form method="post" className="w-full">
            <input type="hidden" name="intent" value="acceptInvoice" />
            <input type="hidden" name="invoiceId" value={paymentInfo.invoiceId} />
            <button
              type="submit"
              disabled={fetcher.state === 'submitting'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700 transition"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Accept Invoice
            </button>
          </fetcher.Form>
          <fetcher.Form method="post" className="w-full">
            <input type="hidden" name="intent" value="rejectInvoice" />
            <input type="hidden" name="invoiceId" value={paymentInfo.invoiceId} />
            <input type="hidden" name="rejectReason" value="Customer declined final invoice" />
            <button
              type="submit"
              disabled={fetcher.state === 'submitting'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 text-white font-semibold shadow-sm hover:bg-rose-700 transition"
            >
              <XCircleIcon className="w-4 h-4" />
              Reject Invoice
            </button>
          </fetcher.Form>
        </div>
      )}
    </div>
  );
};

const PaymentStatusOverview = ({ enginePaymentMap }: { enginePaymentMap: Record<string, EnginePaymentInfo> }) => {
  const fetcher = useFetcher();
  const entries = Object.entries(enginePaymentMap);
  if (entries.length === 0) return null;

  const groups = {
    payment_verified: entries.filter(([, v]) => v.status === "payment_verified" || v.status === "completed"),
    payment_approved: entries.filter(([, v]) => v.status === "payment_approved"),
    payment_submitted: entries.filter(([, v]) => v.status === "payment_submitted"),
    pending_payment: entries.filter(([, v]) => v.status === "pending_payment"),
    payment_rejected: entries.filter(([, v]) => v.status === "payment_rejected"),
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 border-b pb-4 mb-5">
        <div className="p-2 bg-indigo-50 rounded-xl">
          <CreditCardIcon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Payment Status Overview</h3>
          <p className="text-xs text-gray-500">All engines with payment activity</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Verified */}
        {groups.payment_verified.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <ShieldCheckIcon className="h-3 w-3" /> Paid & Verified ({groups.payment_verified.length})
            </p>
            <div className="space-y-2">
              {groups.payment_verified.map(([name, info]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getEngineIcon(name)}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{info.invoiceNumber}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700">₹{info.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awaiting Acceptance */}
        {groups.payment_approved.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <ClockIcon className="h-3 w-3" /> Awaiting Acceptance ({groups.payment_approved.length})
            </p>
            <div className="space-y-2">
              {groups.payment_approved.map(([name, info]) => (
                <div key={name} className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getEngineIcon(name)}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{info.invoiceNumber}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-violet-700">₹{info.amount.toLocaleString()}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <fetcher.Form method="post" className="w-full">
                      <input type="hidden" name="intent" value="acceptInvoice" />
                      <input type="hidden" name="invoiceId" value={info.invoiceId} />
                      <button
                        type="submit"
                        disabled={fetcher.state === 'submitting'}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700 transition text-xs"
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        Accept
                      </button>
                    </fetcher.Form>
                    <fetcher.Form method="post" className="w-full">
                      <input type="hidden" name="intent" value="rejectInvoice" />
                      <input type="hidden" name="invoiceId" value={info.invoiceId} />
                      <input type="hidden" name="rejectReason" value="Customer declined final invoice" />
                      <button
                        type="submit"
                        disabled={fetcher.state === 'submitting'}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white font-semibold shadow-sm hover:bg-rose-700 transition text-xs"
                      >
                        <XCircleIcon className="w-3 h-3" />
                        Reject
                      </button>
                    </fetcher.Form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Verification */}
        {groups.payment_submitted.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <ClockIcon className="h-3 w-3" /> Pending Verification ({groups.payment_submitted.length})
            </p>
            <div className="space-y-2">
              {groups.payment_submitted.map(([name, info]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getEngineIcon(name)}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{info.invoiceNumber}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-700">₹{info.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Created - Awaiting Proof */}
        {groups.pending_payment.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <BanknotesIcon className="h-3 w-3" /> Invoice Created — Awaiting Proof ({groups.pending_payment.length})
            </p>
            <div className="space-y-2">
              {groups.pending_payment.map(([name, info]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getEngineIcon(name)}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{info.invoiceNumber}</p>
                    </div>
                  </div>
                  <Link to={`/payment/invoice/${info.invoiceId}`} className="text-xs font-black text-amber-700 underline flex items-center gap-1 hover:text-amber-900">
                    Upload Proof <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected */}
        {groups.payment_rejected.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <XCircleIcon className="h-3 w-3" /> Rejected — Action Required ({groups.payment_rejected.length})
            </p>
            <div className="space-y-2">
              {groups.payment_rejected.map(([name, info]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getEngineIcon(name)}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{info.invoiceNumber}</p>
                    </div>
                  </div>
                  <Link to="/payment/checkout" className="text-xs font-black text-rose-700 underline flex items-center gap-1 hover:text-rose-900">
                    Retry <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CostBreakdownChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A23CFE', '#FE3C72'];
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Cost Breakdown</h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function CartDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { items: cartItems, user, enginePaymentMap } = useLoaderData<typeof loader>();

  const { subtotal, gst, total } = useMemo(() => {
    const currentSubtotal = cartItems.reduce((acc: number, item: any) => acc + item.price, 0);
    const currentGst = currentSubtotal * 0.18;
    const currentTotal = currentSubtotal + currentGst;
    return { subtotal: currentSubtotal, gst: currentGst, total: currentTotal };
  }, [cartItems]);

  const chartData = useMemo(() =>
    cartItems.map((item: any) => ({ name: item.productName, value: Math.round(item.price * 1.18) })),
    [cartItems]
  );

  // Items that don't yet have a payment or have a rejected payment — need to pay
  const hasUnpaidItems = cartItems.some((item: any) => {
    const info = enginePaymentMap[item.productName];
    return !info || info.status === "payment_rejected";
  });

  useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-gray-300 pb-4 mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Shopping Cart</h2>
            <p className="text-md text-gray-600 mt-2">Review your items and proceed to checkout.</p>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Cart Items */}
              <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-6 border border-gray-200">
                {cartItems.map((item: any) => (
                  <CartItemRow
                    key={item.pk}
                    item={item}
                    paymentInfo={enginePaymentMap[item.productName]}
                  />
                ))}
              </div>

              {/* Right Panel */}
              <div className="lg:col-span-1 space-y-8">
                <OrderSummary subtotal={subtotal} gst={gst} total={total} hasUnpaidItems={hasUnpaidItems} />
                <PaymentStatusOverview enginePaymentMap={enginePaymentMap} />
                {chartData.length > 0 && <CostBreakdownChart data={chartData} />}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Empty cart + payment status if there are any payments */}
              {Object.keys(enginePaymentMap).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PaymentStatusOverview enginePaymentMap={enginePaymentMap} />
                </div>
              )}

              <div className="text-center py-20 bg-white rounded-xl shadow-md border">
                <h3 className="text-2xl font-semibold text-gray-800">Your Cart is Empty</h3>
                <p className="text-gray-500 mt-2 mb-6">Looks like you haven't added any items yet.</p>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Complete an assessment engine to add items to your cart.
                  </p>
                  <Link
                    to="/startTransformationDashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
                  >
                    Browse Engines
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
