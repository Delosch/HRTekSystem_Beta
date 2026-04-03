import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { requireUserSession } from "~/lib/session.server";
import {
  Mail,
  Phone,
  Building2,
  Clock,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  X,
  CheckCircle2,
  Eye,
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
      ExpressionAttributeValues: { ":pt": "CONTACT_MSG" },
    })
  );

  const messages = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return json({ messages });
}

// ── Action (mark read/unread) ─────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const pk = formData.get("pk") as string;
  const sk = (formData.get("sk") as string) || "MESSAGE";
  const newStatus = formData.get("status") as string;

  if (!pk || !newStatus) return json({ success: false });

  const ddb = getDynamoDBDocumentClient();
  await ddb.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { pk, sk },
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

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border border-blue-200",
  read: "bg-gray-100 text-gray-500 border border-gray-200",
  replied: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  archived: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

// ── Detail Modal ──────────────────────────────────────────────────────────────

function MessageModal({ msg, onClose }: { msg: any; onClose: () => void }) {
  const fetcher = useFetcher();

  if (!msg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                {msg.firstName || msg.name} {msg.lastName || ""}
              </h2>
              <p className="text-sm text-gray-500">{msg.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail, label: "Email", value: msg.email },
              { icon: Phone, label: "Phone", value: msg.phone || "—" },
              { icon: Building2, label: "Company", value: msg.company || "—" },
              {
                icon: Clock,
                label: "Received",
                value: new Date(msg.createdAt).toLocaleString("en-IN"),
              },
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

          {/* Message */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Message</p>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </p>
          </div>

          {/* Status update */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Update Status</p>
            <fetcher.Form method="post" className="flex flex-wrap gap-2">
              <input type="hidden" name="pk" value={msg.pk} />
              <input type="hidden" name="sk" value={msg.sk || "MESSAGE"} />
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  name="status"
                  value={val}
                  type="submit"
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${
                    (msg.status || "new") === val
                      ? STATUS_STYLES[val] + " ring-2 ring-offset-1 ring-indigo-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </fetcher.Form>
          </div>

          {/* Reply shortcut */}
          <div className="border-t border-gray-100 pt-4">
            <a
              href={`mailto:${msg.email}?subject=Re: Your inquiry via HRTekSystem`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Reply via Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminMessages() {
  const { messages } = useLoaderData<any>();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const filtered = messages.filter((m: any) => {
    const matchStatus = filterStatus === "all" || (m.status || "new") === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${m.firstName || m.name || ""} ${m.lastName || ""}`.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const newCount = messages.filter((m: any) => !m.status || m.status === "new").length;

  const counts = messages.reduce((acc: Record<string, number>, m: any) => {
    const s = m.status || "new";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Detail modal */}
      {selected && (
        <MessageModal msg={selected} onClose={() => setSelected(null)} />
      )}

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
                {newCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {newCount} new
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {messages.length} total message{messages.length !== 1 ? "s" : ""} received from the website
              </p>
            </div>
          </div>

          {/* Pipeline counts */}
          <div className="hidden lg:flex items-center gap-2">
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
              placeholder="Search by name, email, company…"
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
            Showing <strong className="text-gray-900">{filtered.length}</strong> of {messages.length}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Sender</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Contact</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Company</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide w-2/5">Message</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Received</th>
                  <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <MessageSquare className="h-10 w-10 opacity-30" />
                        <p className="font-medium">No messages found</p>
                        <p className="text-xs">
                          {search || filterStatus !== "all"
                            ? "Try adjusting your search or filter"
                            : "Contact form submissions will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((msg: any) => {
                    const status = msg.status || "new";
                    const isNew = status === "new";
                    return (
                      <tr
                        key={msg.pk}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isNew ? "bg-blue-50/30" : ""}`}
                        onClick={() => setSelected(msg)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isNew ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                              {((msg.firstName || msg.name || "?")[0]).toUpperCase()}
                            </div>
                            <div>
                              <p className={`font-semibold ${isNew ? "text-gray-900" : "text-gray-700"}`}>
                                {msg.firstName || msg.name} {msg.lastName || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <a
                                href={`mailto:${msg.email}`}
                                className="text-xs text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {msg.email}
                              </a>
                            </div>
                            {msg.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-600">{msg.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="text-sm">{msg.company || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                            {msg.message}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[status]}`}>
                            {STATUS_LABELS[status] || status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs">
                              {new Date(msg.createdAt).toLocaleDateString("en-IN", {
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
                              setSelected(msg);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
