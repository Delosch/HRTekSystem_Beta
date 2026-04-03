import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigation } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { getPendingUsers, approveUser, rejectUser } from "~/models/user.model.server";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  Globe,
  Calendar,
  Search,
  CheckCircle2,
  AlertTriangle,
  Inbox,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminSession(request);
  const users = await getPendingUsers();
  return json({ users });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdminSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const userId = formData.get("userId") as string;
  const reason = formData.get("reason") as string | undefined;

  if (!userId) return json({ error: "Missing userId" }, { status: 400 });

  try {
    if (intent === "approve") {
      await approveUser(userId);
      return json({ success: true, message: "User approved and notified." });
    }
    if (intent === "reject") {
      await rejectUser(userId, reason || undefined);
      return json({ success: true, message: "User rejected and notified." });
    }
    return json({ error: "Invalid intent" }, { status: 400 });
  } catch (err: any) {
    return json({ error: err.message || "Action failed" }, { status: 500 });
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface RejectModalProps {
  user: any;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function RejectModal({ user, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Reject Account</h3>
            <p className="text-sm text-slate-500">{user.first_name} {user.last_name}</p>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Reason <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Incomplete information, outside target market..."
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all"
        />
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Confirm Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminRequests() {
  const { users } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<any>();
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const isSubmitting = fetcher.state !== "idle";

  // After successful action, mark userId as dismissed from list
  const lastResult = fetcher.data;

  const filtered = users.filter(u => {
    const userId = u.pk?.replace("USER#", "") ?? "";
    if (dismissed.has(userId)) return false;
    const q = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  function handleApprove(userId: string) {
    const fd = new FormData();
    fd.set("intent", "approve");
    fd.set("userId", userId);
    fetcher.submit(fd, { method: "post" });
    setDismissed(prev => new Set(prev).add(userId));
  }

  function handleRejectConfirm(reason: string) {
    const userId = rejectTarget?.pk?.replace("USER#", "");
    if (!userId) return;
    const fd = new FormData();
    fd.set("intent", "reject");
    fd.set("userId", userId);
    fd.set("reason", reason);
    fetcher.submit(fd, { method: "post" });
    setDismissed(prev => new Set(prev).add(userId));
    setRejectTarget(null);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Company Requests</h1>
            <p className="text-sm text-slate-500">New registrations pending approval</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Review", value: users.length, color: "amber", icon: Clock },
          { label: "Approved Today", value: dismissed.size, color: "emerald", icon: CheckCircle2 },
          { label: "Action Required", value: Math.max(0, users.length - dismissed.size), color: "red", icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 text-${s.color}-500`} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        />
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {lastResult?.success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium"
          >
            {lastResult.message}
          </motion.div>
        )}
        {lastResult?.error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
          >
            {lastResult.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">All clear!</h3>
          <p className="text-sm text-slate-500">No pending registrations at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(user => {
              const userId = user.pk?.replace("USER#", "") ?? "";
              return (
                <motion.div
                  key={userId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-black shrink-0">
                        {(user.first_name?.[0] ?? "?").toUpperCase()}{(user.last_name?.[0] ?? "").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="w-3 h-3" />{user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Phone className="w-3 h-3" />{user.phone}
                            </span>
                          )}
                          {user.country_iso && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Globe className="w-3 h-3" />{user.country_iso}
                            </span>
                          )}
                          {user.createdAt && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />Registered {formatDate(user.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg uppercase tracking-wide border border-amber-100">
                        Pending
                      </span>
                      <button
                        onClick={() => handleApprove(userId)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(user)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            user={rejectTarget}
            onClose={() => setRejectTarget(null)}
            onConfirm={handleRejectConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
