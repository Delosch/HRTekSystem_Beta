import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "~/components/DashboardComponents/Sidebar";
import { getEnhancedUser } from "~/utils/user.server";
import { requireUserSession } from "~/lib/session.server";
import { createEnginePaymentRequest, getEngineAccessStatus, getEngineAccessStatuses, clearAllPaymentRequests } from "~/models/payment.model.server";
import { isCoreEngineClient as isCoreEngine, isAdvancedEngineClient as isAdvancedEngine } from "~/utils/engine-classification";
import { calculatePricing, type EngineType } from "~/services/pricing.server";
import { addOrUpdateCartItem } from "~/models/cart.model.server";

const ENGINES: Array<{ name: string; engineType: EngineType; assessmentRoute: string; actionLabel?: string }> = [
  { name: "HR Tech Diagnostics", engineType: "ai-maturity", assessmentRoute: "/ai-maturity/assessment", actionLabel: "Open Assessment" },
  { name: "HR Digital Roadmap", engineType: "roadmap", assessmentRoute: "/digital-roadmap/assessment", actionLabel: "Open Assessment" },
  { name: "HR HCM Vendor Fit", engineType: "hcm-vendor-fit", assessmentRoute: "/engine/HCM%20Vendor%20Fit%20Engine", actionLabel: "Open Assessment" },
  { name: "HR Shared Services", engineType: "shared-services", assessmentRoute: "/shared-services/assessment", actionLabel: "Open Assessment" },
  { name: "Intelligent Change Management System", engineType: "icms", assessmentRoute: "/change-management/assessment", actionLabel: "Open Assessment" },
  { name: "HR Tech Advisory", engineType: "hti", assessmentRoute: "/hti", actionLabel: "Open Assessment" },
];

interface PricingPreviewData {
  basePrice: number;
  gst: number;
  totalPrice: number;
  employeeTier: string;
  perUserPrice: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getEnhancedUser(request);
  if (!user?.organisationId) return redirect("/auth");

  const accessByEngine = await getEngineAccessStatuses(
    user.organisationId,
    ENGINES.map((engine) => engine.name)
  );

  return json({ user, engines: ENGINES, accessByEngine });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUserSession(request);
  if (!user?.organisationId) return redirect("/auth");

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "request_payment") {
    const engineName = String(formData.get("engineName") || "");
    const employeeCount = Number(formData.get("employeeCount") || 0);

    const selectedEngine = ENGINES.find((engine) => engine.name === engineName);
    if (!selectedEngine || employeeCount <= 0) {
      return json({ error: "Please select an engine and enter a valid employee size." }, { status: 400 });
    }

    const access = await getEngineAccessStatus(user.organisationId, engineName);
    if (access.requestStatus === "approved" && !access.assessmentUnlocked) {
      return json({ error: "This request is already approved. Please pay the approved amount to continue." }, { status: 400 });
    }

    const pricing = calculatePricing({ engine: selectedEngine.engineType, employeeCount });

    await createEnginePaymentRequest({
      orgId: user.organisationId,
      userId: user.userId,
      engineName,
      employeeCount,
      fullAmount: Math.round(pricing.totalPrice),
    });

    return json({ success: `${engineName} payment request sent to admin. You will be notified once the admin configures the installment plan.` });
  }

  if (intent === "pay_installment") {
    const engineName = String(formData.get("engineName") || "");
    const installmentNumber = Number(formData.get("installmentNumber") || 0);
    const access = await getEngineAccessStatus(user.organisationId, engineName);

    if (access.requestStatus !== "approved") {
      return json({ error: "This request is not approved yet." }, { status: 400 });
    }

    if (!access.installments || access.installments.length === 0) {
      return json({ error: "No installment plan configured for this engine." }, { status: 400 });
    }

    const installment = access.installments.find((inst) => inst.installmentNumber === installmentNumber);
    if (!installment) {
      return json({ error: "Invalid installment number." }, { status: 400 });
    }

    if (installment.status !== "unpaid") {
      return json({ error: "This installment has already been paid or is in progress." }, { status: 400 });
    }

    const installmentAmount = installment.amount || 0;
    const baseAmount = Math.round(installmentAmount / 1.18);

    await addOrUpdateCartItem({
      companyId: user.organisationId,
      productName: `${engineName} - Installment #${installmentNumber}`,
      price: baseAmount,
      userId: user.userId,
      employeeCount: access.employeeCount || 0,
    });

    return redirect("/payment/checkout");
  }

  // Legacy: pay full approved request
  if (intent === "pay_approved_request") {
    const engineName = String(formData.get("engineName") || "");
    const access = await getEngineAccessStatus(user.organisationId, engineName);

    if (access.requestStatus !== "approved") {
      return json({ error: "This request is not approved yet." }, { status: 400 });
    }

    if (access.approvedRequestedBaseAmount <= 0) {
      return json({ error: "Approved amount is invalid." }, { status: 400 });
    }

    await addOrUpdateCartItem({
      companyId: user.organisationId,
      productName: engineName,
      price: access.approvedRequestedBaseAmount,
      userId: user.userId,
      employeeCount: access.employeeCount || 0,
    });

    return redirect("/payment/checkout");
  }

  if (intent === "clear_all_engines") {
    await clearAllPaymentRequests(user.organisationId);
    return json({ success: "✅ All engines cleared! Page will refresh with no engines selected." });
  }

  return json({ error: "Invalid action." }, { status: 400 });
}

export default function UserPaymentDashboard() {
  const { user, engines, accessByEngine } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const pricingFetcher = useFetcher<PricingPreviewData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedEngineName, setSelectedEngineName] = useState("");
  const [employeeCountInput, setEmployeeCountInput] = useState("");

  const statusBadgeClass = (status: string) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const summary = useMemo(() => {
    const values = Object.values(accessByEngine || {});
    return {
      approved: values.filter((value) => value.requestStatus === "approved").length,
      pending: values.filter((value) => value.requestStatus === "pending").length,
      assessmentUnlocked: values.filter((value) => value.assessmentUnlocked).length,
      reportsUnlocked: values.filter((value) => value.reportUnlocked).length,
    };
  }, [accessByEngine]);

  // Auto-lock employee count when engine has an active request
  useEffect(() => {
    if (!selectedEngineName) return;
    const access = accessByEngine[selectedEngineName];
    if ((access?.requestStatus === "pending" || access?.requestStatus === "approved") && access?.employeeCount) {
      setEmployeeCountInput(String(access.employeeCount));
    }
  }, [selectedEngineName, accessByEngine]);

  // Refresh page when all engines are cleared
  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success && actionData.success.includes("cleared")) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  // Fetch pricing preview based on employee count
  useEffect(() => {
    const selectedEngine = ENGINES.find((engine) => engine.name === selectedEngineName);
    const employeeCount = Number(employeeCountInput || 0);

    if (!selectedEngine || employeeCount <= 0) return;

    const timer = setTimeout(() => {
      pricingFetcher.submit(
        {
          engine: selectedEngine.engineType,
          employeeCount: String(employeeCount),
          months: "1",
        },
        { method: "post", action: "/api/pricing" }
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedEngineName, employeeCountInput, pricingFetcher]);

  const totalPrice = Number(pricingFetcher.data?.totalPrice || 0);
  const basePrice = Number(pricingFetcher.data?.basePrice || 0);
  const gstPrice = Number(pricingFetcher.data?.gst || 0);

  const formatINR = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Payment Dashboard</h1>
              <p className="text-slate-600 mt-2">Select engine and employee size to request payment. Admin will configure your installment plan.</p>
            </div>
            <Form method="post" className="flex items-center gap-2">
              <input type="hidden" name="intent" value="clear_all_engines" />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition-colors border border-red-300"
              >
                🔄 Reset All Engines
              </button>
            </Form>
          </div>

          {/* Success/Error Messages */}
          {actionData && "success" in actionData && actionData.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-700 font-semibold">{actionData.success}</p>
            </div>
          )}
          {actionData && "error" in actionData && actionData.error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-rose-700 font-semibold">{actionData.error}</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Approved Requests</div><div className="text-2xl font-bold text-slate-900">{summary.approved}</div></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Pending Requests</div><div className="text-2xl font-bold text-slate-900">{summary.pending}</div></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Assessment Unlocked</div><div className="text-2xl font-bold text-slate-900">{summary.assessmentUnlocked}</div></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Report Unlocked</div><div className="text-2xl font-bold text-slate-900">{summary.reportsUnlocked}</div></div>
          </div>

          {/* Request Payment Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-slate-900">Request Payment Approval</h2>
              {selectedEngineName && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEngineName("");
                    setEmployeeCountInput("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  ✕ Clear Selection
                </button>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">Select engine and enter employee size. Admin will review and configure the installment plan for you.</p>
            <Form method="post" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <input type="hidden" name="intent" value="request_payment" />
              <select
                name="engineName"
                required
                value={selectedEngineName}
                onChange={(event) => setSelectedEngineName(event.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select engine</option>
                {engines.map((engine) => (
                  <option key={engine.name} value={engine.name}>{engine.name}</option>
                ))}
              </select>
              <input
                name="employeeCount"
                type="number"
                min={1}
                required
                placeholder="Employee size"
                value={employeeCountInput}
                onChange={(event) => setEmployeeCountInput(event.target.value)}
                disabled={!!selectedEngineName && (accessByEngine[selectedEngineName]?.requestStatus === "pending" || accessByEngine[selectedEngineName]?.requestStatus === "approved")}
                className="px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
              />
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70">{isSubmitting ? "Submitting..." : "Submit Request"}</button>
            </Form>

            {selectedEngineName && (accessByEngine[selectedEngineName]?.requestStatus === "pending" || accessByEngine[selectedEngineName]?.requestStatus === "approved") && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700 font-medium">🔒 Locked: Employee size is fixed until this request is resolved</p>
              </div>
            )}

            {/* Pricing Preview */}
            {selectedEngineName && employeeCountInput && totalPrice > 0 && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="text-sm font-semibold text-blue-900 mb-2">Pricing Preview</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-lg border border-blue-100 p-3">
                    <div className="text-xs text-slate-500">Base Price</div>
                    <div className="font-bold text-slate-900">{formatINR(basePrice)}</div>
                  </div>
                  <div className="bg-white rounded-lg border border-blue-100 p-3">
                    <div className="text-xs text-slate-500">GST (18%)</div>
                    <div className="font-bold text-slate-900">{formatINR(gstPrice)}</div>
                  </div>
                  <div className="bg-white rounded-lg border border-blue-100 p-3">
                    <div className="text-xs text-slate-500">Total Amount</div>
                    <div className="font-bold text-blue-700">{formatINR(totalPrice)}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Admin will configure installment plan after reviewing your request.</p>
              </div>
            )}

            {actionData && "success" in actionData && actionData.success && (
              <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{actionData.success}</p>
            )}
            {actionData && "error" in actionData && actionData.error && (
              <p className="mt-3 text-sm text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">{actionData.error}</p>
            )}
          </div>

          {/* Engine Payment Access Status Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Engine Payment Access Status</h2>
            <div className="space-y-4">
              {engines.map((engine) => {
                const access = accessByEngine[engine.name];
                const isIncludedFree = access.isIncludedFreeWithAdvanced === true;
                const hasInstallments = !isIncludedFree && access.installments && access.installments.length > 0;

                return (
                  <div key={engine.name} className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* Engine header row */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center gap-3 bg-slate-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">{engine.name}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCoreEngine(engine.name) ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {isCoreEngine(engine.name) ? "Core" : "Advanced"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase ${statusBadgeClass(access.requestStatus)}`}>
                            {access.requestStatus}
                          </span>
                          {access.paymentType && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {access.paymentType === "milestone" ? "📊 Milestone" : "💳 Full Payment"}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            Assessment: {access.assessmentUnlocked ? "✅ Unlocked" : "🔒 Locked"}
                          </span>
                          <span className="text-xs text-slate-500">
                            Report: {access.reportUnlocked ? "✅ Unlocked" : "🔒 Locked"}
                          </span>
                        </div>
                        {/* Feature Unlock Progress (Advanced engines with milestones) */}
                        {isAdvancedEngine(engine.name) && access.enabledFeatures && access.enabledFeatures.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {access.enabledFeatures.map((feature: string) => (
                              <span key={feature} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                                ✓ {feature}
                              </span>
                            ))}
                          </div>
                        )}
                        {isCoreEngine(engine.name) && access.requestStatus === "approved" && !access.assessmentUnlocked && !isIncludedFree && (
                          <p className="text-xs text-orange-600 font-medium mt-1">⚠️ Full payment required to unlock access</p>
                        )}
                        {isIncludedFree && (
                          <p className="text-xs text-emerald-600 font-medium mt-1">🎁 Included free with {access.parentAdvancedEngineName || "Advanced Engine"}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {access.fullAmount > 0 && !isIncludedFree && (
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Paid / Total</div>
                            <div className="text-sm font-bold text-slate-900">
                              {formatINR(access.totalPaidAmount)} / {formatINR(access.fullAmount)}
                            </div>
                            {access.remainingAmount > 0 && (
                              <div className="text-xs font-medium text-rose-600">
                                Remaining: {formatINR(access.remainingAmount)}
                              </div>
                            )}
                          </div>
                        )}

                        {access.requestStatus === "rejected" && (
                          <div className="text-right">
                            <span className="text-xs text-rose-600 font-medium">Rejected</span>
                            {access.rejectionReason && (
                              <p className="text-xs text-rose-500 italic max-w-xs">{access.rejectionReason}</p>
                            )}
                          </div>
                        )}

                        {access.assessmentUnlocked && (
                          <a href={engine.assessmentRoute} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 inline-block">{engine.actionLabel || "Open"}</a>
                        )}
                      </div>
                    </div>

                    {/* Installment plan breakdown */}
                    {hasInstallments && (
                      <div className="p-4 border-t border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Installment Plan</h4>
                        <div className="space-y-2">
                          {access.installments!.map((inst) => {
                            const isCurrentInstallment = access.currentInstallment === inst.installmentNumber;
                            const isPaid = inst.status === "paid";
                            const isRejected = inst.status === "rejected";
                            const isSubmitted = inst.status === "payment_submitted";
                            const showProofSubmitted = isSubmitted && !access.assessmentUnlocked;
                            const canPay = inst.status === "unpaid" && (isCurrentInstallment || inst.enabled);

                            return (
                              <div
                                key={inst.installmentNumber}
                                className={`flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg border ${
                                  isPaid ? "bg-emerald-50 border-emerald-200" :
                                  showProofSubmitted ? "bg-amber-50 border-amber-200" :
                                  isRejected ? "bg-rose-50 border-rose-200" :
                                  canPay ? "bg-indigo-50 border-indigo-200" :
                                  "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold shrink-0 ${
                                  isPaid ? "bg-emerald-200 text-emerald-800" :
                                  showProofSubmitted ? "bg-amber-200 text-amber-800" :
                                  canPay ? "bg-indigo-200 text-indigo-800" :
                                  "bg-slate-200 text-slate-600"
                                }`}>
                                  {inst.installmentNumber}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-800">{inst.percentage}%</span>
                                    <span className="text-sm font-bold text-slate-900">{formatINR(inst.amount || 0)}</span>
                                  </div>
                                  {inst.splitDetails && Array.isArray(inst.splitDetails) && inst.splitDetails.length > 0 && (
                                    <table className="w-full text-xs mt-2 border border-slate-200 rounded">
                                      <thead>
                                        <tr className="bg-slate-100">
                                          <th className="px-2 py-1 text-left font-semibold text-slate-500 border-b">Item</th>
                                          <th className="px-2 py-1 text-left font-semibold text-slate-500 border-b">Description</th>
                                          <th className="px-2 py-1 text-left font-semibold text-slate-500 border-b">HSN</th>
                                          <th className="px-2 py-1 text-left font-semibold text-slate-500 border-b">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {inst.splitDetails.map((split: any, sIdx: number) => (
                                          <tr key={sIdx} className="border-b border-slate-100">
                                            <td className="px-2 py-1 text-slate-700">{split.item || "-"}</td>
                                            <td className="px-2 py-1 text-slate-600">{split.description || "-"}</td>
                                            <td className="px-2 py-1 text-slate-600 font-mono">{split.hsnCode || "-"}</td>
                                            <td className="px-2 py-1 text-slate-700 font-medium">{split.amount || "-"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {isPaid && (
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">✅ Paid</span>
                                      <a href={engine.assessmentRoute} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm border border-blue-700 block text-center">
                                        {engine.actionLabel || "Open Assessment"}
                                      </a>
                                    </div>
                                  )}
                                  {showProofSubmitted && (
                                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">⏳ Proof Submitted</span>
                                  )}
                                  {isRejected && (
                                    <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">❌ Rejected</span>
                                  )}
                                  {canPay && (
                                    <Form method="post">
                                      <input type="hidden" name="intent" value="pay_installment" />
                                      <input type="hidden" name="engineName" value={engine.name} />
                                      <input type="hidden" name="installmentNumber" value={inst.installmentNumber} />
                                      <button type="submit" className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm">
                                        Pay Now
                                      </button>
                                    </Form>
                                  )}
                                  {inst.status === "unpaid" && !canPay && (
                                    <span className="text-xs text-slate-400">Upcoming</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No installments yet but approved - legacy fallback */}
                    {!hasInstallments && !isIncludedFree && access.requestStatus === "approved" && !access.assessmentUnlocked && (
                      <div className="p-4 border-t border-slate-200">
                        <Form method="post">
                          <input type="hidden" name="intent" value="pay_approved_request" />
                          <input type="hidden" name="engineName" value={engine.name} />
                          <button type="submit" className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
                            Pay & Upload Proof
                          </button>
                        </Form>
                      </div>
                    )}

                    {/* Pending message */}
                    {access.requestStatus === "pending" && (
                      <div className="p-4 border-t border-slate-200 bg-amber-50">
                        <p className="text-sm text-amber-700">⏳ Waiting for admin to review and configure installment plan...</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
