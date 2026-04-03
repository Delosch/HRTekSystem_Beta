import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { requireUserSession } from "~/lib/session.server";
import {
  Briefcase,
  Mail,
  Phone,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUserSession(request);
  const userWithRole = user as any;
  if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
    throw new Response("Unauthorized", { status: 403 });
  }

  const ddb = getDynamoDBDocumentClient();
  const result = await ddb.send(
    new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression: "profile_type = :pt",
      ExpressionAttributeValues: { ":pt": "CAREER_APP" },
    })
  );

  const applications = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return json({ applications });
}

// ── Action (update status) ─────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const pk = formData.get("pk") as string;
  const newStatus = formData.get("status") as string;

  if (!pk || !newStatus) return json({ success: false });

  const ddb = getDynamoDBDocumentClient();
  await ddb.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { pk, sk: "APPLICATION" },
      UpdateExpression: "SET #s = :s, updatedAt = :u",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":s": newStatus,
        ":u": new Date().toISOString(),
      },
    })
  );

  return json({ success: true });
}

// ── Status badge helper ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border border-amber-200",
  shortlisted: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  hired: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  hired: "Hired",
  rejected: "Rejected",
};

// ── Detail Modal ──────────────────────────────────────────────────────────────

function ApplicationModal({ app, onClose }: { app: any; onClose: () => void }) {
  const fetcher = useFetcher();

  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                {app.firstName} {app.lastName}
              </h2>
              <p className="text-sm text-gray-500">{app.jobRole}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Mail, label: "Email", value: app.email },
              { icon: Phone, label: "Phone", value: app.phone || "—" },
              { icon: MapPin, label: "Location", value: app.location || "—" },
              {
                icon: Clock,
                label: "Submitted",
                value: new Date(app.createdAt).toLocaleString("en-IN"),
              },
              {
                icon: FileText,
                label: "Resume",
                value: app.resumeFileName || "Not provided",
              },
              { icon: Briefcase, label: "Application ID", value: app.applicationId || app.pk },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <p className="text-sm text-gray-900 font-medium break-all">{value}</p>
              </div>
            ))}
          </div>

          {/* Status update */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Update Application Status</p>
            <fetcher.Form method="post" className="flex flex-wrap gap-2">
              <input type="hidden" name="pk" value={app.pk} />
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  name="status"
                  value={val}
                  type="submit"
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${
                    app.status === val
                      ? STATUS_STYLES[val] + " ring-2 ring-offset-1 ring-indigo-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminCareers() {
  const { applications } = useLoaderData<any>();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const filtered = applications.filter((a: any) => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.jobRole?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = applications.reduce((acc: Record<string, number>, a: any) => {
    acc[a.status || "new"] = (acc[a.status || "new"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Detail modal */}
      {selected && (
        <ApplicationModal
          app={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Career Applications</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {applications.length} total application{applications.length !== 1 ? "s" : ""} received
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Pipeline
            </span>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <span
                key={val}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[val]}`}
              >
                {counts[val] || 0} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <span className="ml-auto text-sm text-gray-500">
            Showing <strong className="text-gray-900">{filtered.length}</strong> of {applications.length}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Applicant</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role Applied</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Contact</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Location</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Resume</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Received</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Briefcase className="h-10 w-10 opacity-30" />
                        <p className="font-medium">No applications found</p>
                        <p className="text-xs">
                          {search || filterStatus !== "all"
                            ? "Try adjusting your search or filter"
                            : "Applications will appear here once submitted"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app: any) => (
                    <tr
                      key={app.pk}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelected(app)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                            {(app.firstName?.[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {app.firstName} {app.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-800">{app.jobRole || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <a
                              href={`mailto:${app.email}`}
                              className="hover:text-indigo-600 transition-colors text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {app.email}
                            </a>
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="text-xs">{app.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-sm">{app.location || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate max-w-[120px]">
                            {app.resumeFileName || "Not provided"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            STATUS_STYLES[app.status || "new"]
                          }`}
                        >
                          {STATUS_LABELS[app.status || "new"] || app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs">
                            {new Date(app.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(app);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
