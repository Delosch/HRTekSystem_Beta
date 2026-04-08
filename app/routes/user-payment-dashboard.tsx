import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "~/components/DashboardComponents/Sidebar";
import { getEnhancedUser } from "~/utils/user.server";
import { requireUserSession } from "~/lib/session.server";
import { calculatePricing, type EngineType } from "~/services/pricing.server";
import { addOrUpdateCartItem } from "~/models/cart.model.server";
import { createEnginePaymentRequest, getEngineAccessStatus, getEngineAccessStatuses } from "~/models/payment.model.server";

const ENGINES: Array<{ name: string; engineType: EngineType; assessmentRoute: string; actionLabel?: string }> = [
  { name: "HR Technology Maturity Analysis", engineType: "ai-maturity", assessmentRoute: "/ai-maturity/assessment", actionLabel: "Open Assessment" },
  { name: "HR Transformation Roadmap Generator", engineType: "roadmap", assessmentRoute: "/digital-roadmap/assessment", actionLabel: "Open Assessment" },
  { name: "HCM Vendor Fit Engine", engineType: "hcm-vendor-fit", assessmentRoute: "/engine/HCM%20Vendor%20Fit%20Engine", actionLabel: "Open Assessment" },
  { name: "Shared Service Designer", engineType: "shared-services", assessmentRoute: "/shared-services/assessment", actionLabel: "Open Assessment" },
  { name: "Intelligent Change Management", engineType: "icms", assessmentRoute: "/change-management/assessment", actionLabel: "Open Assessment" },
  { name: "HTI - HR Transformation Intelligence", engineType: "hti", assessmentRoute: "/hti", actionLabel: "Open HTI" },
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
    const initialPercent = Number(formData.get("initialPercent") || 0);

    const selectedEngine = ENGINES.find((engine) => engine.name === engineName);
    if (!selectedEngine || employeeCount <= 0 || initialPercent <= 0 || initialPercent > 100) {
      return json({ error: "Invalid request details." }, { status: 400 });
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
      requestedPercent: initialPercent,
    });

    return json({ success: `${engineName} payment request sent to admin for approval.` });
  }

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
  const [initialPercentInput, setInitialPercentInput] = useState("");

  const handleInitialPercentChange = (rawValue: string) => {
    if (rawValue === "") {
      setInitialPercentInput("");
      return;
    }

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    const clamped = Math.min(100, Math.max(0, parsed));
    setInitialPercentInput(String(clamped));
  };

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

  // Auto-lock employee count when engine is selected and already has an active payment request
  useEffect(() => {
    if (!selectedEngineName) return;
    
    const access = accessByEngine[selectedEngineName];
    // Only lock if there's a pending or approved request (not rejected or none)
    if ((access?.requestStatus === "pending" || access?.requestStatus === "approved") && access?.employeeCount) {
      setEmployeeCountInput(String(access.employeeCount));
    }
  }, [selectedEngineName, accessByEngine]);

  // Fetch pricing based on employee count
  useEffect(() => {
    const selectedEngine = ENGINES.find((engine) => engine.name === selectedEngineName);
    const employeeCount = Number(employeeCountInput || 0);

    if (!selectedEngine || employeeCount <= 0) {
      return;
    }

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

  const initialPercent = Number(initialPercentInput || 0);
  const totalPrice = Number(pricingFetcher.data?.totalPrice || 0);
  const basePrice = Number(pricingFetcher.data?.basePrice || 0);
  const gstPrice = Number(pricingFetcher.data?.gst || 0);
  const requestedNow =
    totalPrice > 0 && initialPercent > 0
      ? Math.round((totalPrice * Math.min(100, Math.max(1, initialPercent))) / 100)
      : 0;

  const formatINR = (amount: number) => `Rs ${Math.round(amount).toLocaleString("en-IN")}`;

  const handleDownloadProforma = () => {
    if (!selectedEngineName || !employeeCountInput || totalPrice <= 0) return;

    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;

    const now = new Date();
    const documentNo = `PFI-PREVIEW-${now.getTime()}`;

    const logoUrl = `${window.location.origin}/hrtek_logo.png`;

    popup.document.write(`
      <html>
        <head>
          <title>Proforma Invoice Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .title { font-size: 26px; font-weight: 700; margin: 0; color: #020617; }
            .meta { font-size: 12px; color: #475569; }
            .box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #334155; }
            .total-row td { font-weight: 700; background: #f8fafc; }
            .muted { color: #64748b; font-size: 12px; }
            .brand-strip { height: 6px; background: linear-gradient(90deg, #1d4ed8, #0ea5e9); border-radius: 999px; margin-bottom: 14px; }
            .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
            .brand img { width: 40px; height: 40px; object-fit: contain; }
            .brand-name { font-size: 18px; font-weight: 800; letter-spacing: 0.2px; color: #0f172a; }
            .badge { display: inline-flex; padding: 6px 10px; background: #dbeafe; color: #1d4ed8; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
            .footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="brand-strip"></div>
          <div class="header">
            <div>
              <div class="brand">
                <img src="${logoUrl}" alt="HRTek Logo" />
                <div>
                  <div class="brand-name">HR-Tek System</div>
                  <div class="meta">Intelligent HR Transformation Platform</div>
                </div>
              </div>
              <p class="title">Proforma Invoice Preview</p>
              <p class="meta">Generated: ${now.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <div class="badge">Proforma</div>
              <br />
              <p class="meta"><strong>Document:</strong> ${documentNo}</p>
              <p class="meta"><strong>Type:</strong> PROFORMA</p>
            </div>
          </div>

          <div class="box">
            <p><strong>Engine:</strong> ${selectedEngineName}</p>
            <p><strong>Employee Size:</strong> ${Number(employeeCountInput).toLocaleString("en-IN")}</p>
            <p><strong>Initial Requested %:</strong> ${initialPercent || 0}%</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Base Price</td><td>${formatINR(basePrice)}</td></tr>
              <tr><td>GST (18%)</td><td>${formatINR(gstPrice)}</td></tr>
              <tr class="total-row"><td>Total Payable</td><td>${formatINR(totalPrice)}</td></tr>
              <tr><td>Requested Now (${initialPercent || 0}%)</td><td>${formatINR(requestedNow)}</td></tr>
            </tbody>
          </table>

          <p class="muted" style="margin-top: 16px;">This is a pre-request proforma preview. Final invoice is issued after payment verification approval.</p>

          <div class="footer">
            HR-Tek System | support@hrteksystem.com | This is system-generated proforma data for payment approval workflow.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Payment Dashboard</h1>
            <p className="text-slate-600 mt-2">Select engine, enter employee size, request initial payment approval, and unlock assessments/reports based on payment completion.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Approved Requests</div><div className="text-2xl font-bold text-slate-900">{summary.approved}</div></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Pending Requests</div><div className="text-2xl font-bold text-slate-900">{summary.pending}</div></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Assessment Unlocked</div><div className="text-2xl font-bold text-slate-900">{summary.assessmentUnlocked}</div></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">Report Unlocked</div><div className="text-2xl font-bold text-slate-900">{summary.reportsUnlocked}</div></div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Request Initial Payment Approval</h2>
            <p className="text-sm text-slate-600 mt-1">Admin reviews this request and can approve/reject. Assessment access unlocks only after approved amount is paid.</p>
            <Form method="post" className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
              <div>
                <input
                  name="employeeCount"
                  type="number"
                  min={1}
                  required
                  placeholder="Employee size"
                  value={employeeCountInput}
                  onChange={(event) => setEmployeeCountInput(event.target.value)}
                  disabled={selectedEngineName && (accessByEngine[selectedEngineName]?.requestStatus === "pending" || accessByEngine[selectedEngineName]?.requestStatus === "approved")}
                  className="px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
                />
                {selectedEngineName && (accessByEngine[selectedEngineName]?.requestStatus === "pending" || accessByEngine[selectedEngineName]?.requestStatus === "approved") && (
                  <p className="text-xs text-amber-600 mt-1">🔒 Locked: Employee size is fixed until this request is resolved</p>
                )}
              </div>
              <input
                name="initialPercent"
                type="number"
                min={1}
                max={100}
                required
                placeholder="Initial % to pay"
                value={initialPercentInput}
                onChange={(event) => handleInitialPercentChange(event.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              />
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70">{isSubmitting ? "Submitting..." : "Request Payment"}</button>
            </Form>

            {(selectedEngineName || employeeCountInput || initialPercentInput) && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-sm font-semibold text-blue-900">Proforma Invoice Preview</div>
                  <button
                    type="button"
                    onClick={handleDownloadProforma}
                    disabled={totalPrice <= 0}
                    className="px-3 py-1.5 rounded-md bg-white border border-blue-300 text-blue-700 text-xs font-semibold hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Download Proforma PDF
                  </button>
                </div>
                {totalPrice > 0 ? (
                  <>
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="text-xs text-slate-500">Document Type</div>
                      <div className="font-bold text-slate-900">Proforma Invoice</div>
                    </div>
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="text-xs text-slate-500">Invoice Number</div>
                      <div className="font-bold text-slate-900">Auto-generated on request</div>
                    </div>
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="text-xs text-slate-500">Engine</div>
                      <div className="font-bold text-slate-900">{selectedEngineName}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="text-xs text-slate-500">Base Price</div>
                      <div className="font-bold text-slate-900">Rs {Math.round(basePrice).toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="text-xs text-slate-500">GST (18%)</div>
                      <div className="font-bold text-slate-900">Rs {Math.round(gstPrice).toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="text-xs text-slate-500">Total Payable</div>
                      <div className="font-bold text-slate-900">Rs {Math.round(totalPrice).toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="text-xs text-slate-500">Requested Now ({initialPercent || 0}%)</div>
                      <div className="font-bold text-blue-700">Rs {Math.round(requestedNow).toLocaleString()}</div>
                    </div>
                  </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-600">
                    Select engine and enter employee size to preview the proforma invoice before requesting.
                  </div>
                )}
              </div>
            )}

            {actionData && "success" in actionData && actionData.success && (
              <p className="mt-3 text-sm text-emerald-700">{actionData.success}</p>
            )}
            {actionData && "error" in actionData && actionData.error && (
              <p className="mt-3 text-sm text-rose-700">{actionData.error}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Engine Payment Access Status</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4">Engine</th>
                    <th className="py-2 pr-4">Request</th>
                    <th className="py-2 pr-4">Paid</th>
                    <th className="py-2 pr-4">Pending</th>
                    <th className="py-2 pr-4">Assessment</th>
                    <th className="py-2 pr-4">Report</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {engines.map((engine) => {
                    const access = accessByEngine[engine.name];
                    return (
                      <tr key={engine.name} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-medium text-slate-800">{engine.name}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full border text-xs font-semibold uppercase ${statusBadgeClass(access.requestStatus)}`}>
                            {access.requestStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">Rs {Math.round(access.totalPaidAmount).toLocaleString()}</td>
                        <td className="py-3 pr-4 text-slate-700">Rs {Math.round(access.pendingAmount).toLocaleString()}</td>
                        <td className="py-3 pr-4">{access.assessmentUnlocked ? "Unlocked" : "Locked"}</td>
                        <td className="py-3 pr-4">{access.reportUnlocked ? "Unlocked" : "Locked"}</td>
                        <td className="py-3">
                          {access.requestStatus === "rejected" ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-rose-600 font-medium">Rejected</span>
                              {access.rejectionReason && (
                                <span className="text-xs text-rose-500 italic max-w-xs">{access.rejectionReason}</span>
                              )}
                            </div>
                          ) : access.requestStatus === "approved" && !access.assessmentUnlocked ? (
                            <Form method="post">
                              <input type="hidden" name="intent" value="pay_approved_request" />
                              <input type="hidden" name="engineName" value={engine.name} />
                              <button type="submit" className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">Pay & Upload Proof</button>
                            </Form>
                          ) : access.assessmentUnlocked ? (
                            <a href={engine.assessmentRoute} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 inline-block">{engine.actionLabel || "Open"}</a>
                          ) : (
                            <span className="text-xs text-slate-500">Awaiting approval</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
