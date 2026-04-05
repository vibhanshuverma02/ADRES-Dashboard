"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter }   from "next/navigation";
import { motion }      from "framer-motion";
import {
  Search, Filter, RefreshCw, TicketIcon,
  Clock, CheckCircle, AlertCircle, XCircle,
} from "lucide-react";

import { TicketStatus, TicketPriority, CATEGORY_LABELS, AdminStats, Ticket, TicketCategory, ticketApi, PRIORITY_COLORS, STATUS_COLORS } from "helper/ticket-api";
import { Button, Form } from "node_modules/react-bootstrap/esm";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const STATUS_OPTIONS: { value: TicketStatus | ""; label: string }[] = [
  { value: "",            label: "All Statuses" },
  { value: "OPEN",        label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING",     label: "Waiting" },
  { value: "RESOLVED",    label: "Resolved" },
  { value: "CLOSED",      label: "Closed" },
];

const PRIORITY_OPTIONS: { value: TicketPriority | ""; label: string }[] = [
  { value: "",       label: "All Priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH",   label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW",    label: "Low" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color,
}: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}>
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6 opacity-70" />
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      </div>
    </div>
  );
}

// ── Priority badge ─────────────────────────────────────────────────────────
function PriorityDot({ priority }: { priority: TicketPriority }) {
  const map: Record<TicketPriority, string> = {
    URGENT: "bg-red-500", HIGH: "bg-orange-500",
    MEDIUM: "bg-yellow-400", LOW: "bg-slate-300",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[priority]}`} />;
}

export default function AdminTicketsPage() {
  const router = useRouter();

  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal]     = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [page, setPage]         = useState(1);

  const fetchStats = useCallback(async () => {
    try { setStats(await ticketApi.adminStats()); } catch {}
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.adminList({
        ...(status   ? { status }   : {}),
        ...(priority ? { priority } : {}),
        ...(category ? { category } : {}),
        ...(search   ? { search }   : {}),
        page, limit: 15,
      });
      setTickets(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {}
    setLoading(false);
  }, [status, priority, category, search, page]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [status, priority, category, search]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <TicketIcon className="w-7 h-7 text-blue-600" />
              Support Tickets
            </h1>
            <p className="text-slate-500 text-sm mt-1">{total} total tickets</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchTickets(); }}
            className="gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total"       value={stats.counts.total}      icon={TicketIcon}   color="bg-white border-slate-200 text-slate-700" />
            <StatCard label="Open"        value={stats.counts.open}       icon={AlertCircle}  color="bg-blue-50 border-blue-200 text-blue-700" />
            <StatCard label="In Progress" value={stats.counts.inProgress} icon={Clock}        color="bg-violet-50 border-violet-200 text-violet-700" />
            <StatCard label="Waiting"     value={stats.counts.waiting}    icon={Clock}        color="bg-amber-50 border-amber-200 text-amber-700" />
            <StatCard label="Resolved"    value={stats.counts.resolved}   icon={CheckCircle}  color="bg-green-50 border-green-200 text-green-700" />
            <StatCard label="Closed"      value={stats.counts.closed}     icon={XCircle}      color="bg-slate-100 border-slate-200 text-slate-600" />
          </div>
        )}

        {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
  <div className="d-flex flex-wrap gap-3 align-items-end">

    {/* Search */}
    <Form.Group className="flex-grow-1" style={{ minWidth: "200px" }}>
      <Form.Label>Search</Form.Label>
      <Form.Control
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search subject, email, ticket #…"
      />
    </Form.Group>

    {/* Status */}
    <Form.Group>
      <Form.Label>Status</Form.Label>
      <Form.Select
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>

    {/* Priority */}
    <Form.Group>
      <Form.Label>Priority</Form.Label>
      <Form.Select
        value={priority}
        onChange={(e) => setPriority(e.target.value as any)}
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>

    {/* Category */}
    <Form.Group>
      <Form.Label>Category</Form.Label>
      <Form.Select
        value={category}
        onChange={(e) => setCategory(e.target.value as any)}
      >
        {CATEGORY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>

    {/* Clear Filters */}
    {(status || priority || category || search) && (
      <div className="mb-2">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => {
            setStatus("");
            setPriority("");
            setCategory("");
            setSearch("");
          }}
        >
          Clear Filters
        </Button>
      </div>
    )}

  </div>
</div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading…
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Ticket</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Subject</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">From</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Priority</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/tickets/${t.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-bold">
                        {t.ticketNumber}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium text-slate-800 truncate">{t.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t.replies.length} repl{t.replies.length === 1 ? "y" : "ies"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {CATEGORY_LABELS[t.category]}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <PriorityDot priority={t.priority} />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[t.priority]}`}>
                            {t.priority}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status]}`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" className="text-xs h-7"
                          onClick={(e) => { e.stopPropagation(); router.push(`/superadmin/Ticket/${t.id}`); }}>
                          Open
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}>←</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}>→</Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}