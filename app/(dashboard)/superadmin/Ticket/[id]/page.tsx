"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter }        from "next/navigation";
import { motion, AnimatePresence }     from "framer-motion";
import {
  ArrowLeft, Send, ChevronDown, User, Shield,
  Clock, Paperclip,
} from "lucide-react";
import { TicketStatus, TicketPriority, Ticket, ticketApi, STATUS_COLORS, PRIORITY_COLORS, CATEGORY_LABELS } from "helper/ticket-api";
import { Button } from "node_modules/react-bootstrap/esm";


function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_OPTS: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
const PRIORITY_OPTS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function AdminTicketDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [ticket, setTicket]       = useState<Ticket | null>(null);
  const [loading, setLoading]     = useState(true);
  const [replyMsg, setReplyMsg]   = useState("");
  const [replying, setReplying]   = useState(false);
  const [updating, setUpdating]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // Inline update state
  const [selStatus,   setSelStatus]   = useState<TicketStatus>("OPEN");
  const [selPriority, setSelPriority] = useState<TicketPriority>("MEDIUM");
  const [note, setNote]               = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const t = await ticketApi.adminGet(id);
        setTicket(t);
        setSelStatus(t.status);
        setSelPriority(t.priority);
        setNote(t.internalNote ?? "");
      } catch {
        setError("Failed to load ticket.");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Scroll to bottom of thread on new reply
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.replies.length]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    setReplying(true); setError(""); setSuccess("");
    try {
      await ticketApi.adminReply(id, replyMsg.trim());
      setReplyMsg("");
      setSuccess("Reply sent successfully.");
      // Refresh ticket
      const t = await ticketApi.adminGet(id);
      setTicket(t); setSelStatus(t.status);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reply.");
    }
    setReplying(false);
  }

  async function handleUpdate() {
    setUpdating(true); setError(""); setSuccess("");
    try {
      const t = await ticketApi.adminUpdate(id, {
        status:       selStatus,
        priority:     selPriority,
        internalNote: note || undefined,
      });
      setTicket((prev) => prev ? { ...prev, ...t } : prev);
      setSuccess("Ticket updated.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed.");
    }
    setUpdating(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-slate-400">
      <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent
                       rounded-full animate-spin mr-2" />
      Loading…
    </div>
  );

  if (!ticket) return (
    <div className="flex items-center justify-center min-h-screen text-slate-500">
      Ticket not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push("/admin/tickets")}
          className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="font-mono text-sm text-blue-600 font-bold">{ticket.ticketNumber}</p>
          <p className="font-semibold text-slate-800 text-base leading-tight">{ticket.subject}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[ticket.status]}`}>
          {ticket.status.replace("_", " ")}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Thread ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Original message */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-blue-700 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{ticket.name}</p>
                  <p className="text-blue-200 text-xs">{ticket.email}</p>
                </div>
                <span className="ml-auto text-blue-200 text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">
                {CATEGORY_LABELS[ticket.category]}
              </p>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                {ticket.description}
              </p>
              {ticket.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ticket.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50
                                 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100">
                      <Paperclip className="w-3 h-3" /> Attachment {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reply thread */}
          <AnimatePresence>
            {ticket.replies.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  r.isAdminReply
                    ? "border-violet-200"
                    : "border-slate-200 ml-4"
                }`}
              >
                <div className={`px-5 py-3 flex items-center gap-3 ${
                  r.isAdminReply ? "bg-violet-50" : "bg-slate-50"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    r.isAdminReply ? "bg-violet-200" : "bg-slate-200"
                  }`}>
                    {r.isAdminReply
                      ? <Shield className="w-4 h-4 text-violet-700" />
                      : <User className="w-4 h-4 text-slate-600" />
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${
                      r.isAdminReply ? "text-violet-800" : "text-slate-700"
                    }`}>
                      {r.isAdminReply ? `${r.senderName} (Support)` : r.senderName}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {r.message}
                  </p>
                  {r.attachments?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.attachments.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50
                                     border border-blue-200 px-3 py-1 rounded-full">
                          <Paperclip className="w-3 h-3" /> File {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />

          {/* Reply box */}
          {!["RESOLVED", "CLOSED"].includes(ticket.status) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Reply to User</p>
              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)}
                  placeholder="Type your reply…"
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                    disabled={replying || !replyMsg.trim()}>
                    {replying ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent
                                       rounded-full animate-spin" />
                    ) : <Send className="w-4 h-4" />}
                    Send Reply
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Feedback */}
          {(error || success) && (
            <div className={`rounded-xl px-4 py-3 text-sm ${
              error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}>
              {error || success}
            </div>
          )}
        </div>

        {/* ── RIGHT: Actions panel ── */}
        <div className="space-y-4">

          {/* Ticket info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ticket Info
            </p>
            <InfoRow label="Opened"    value={formatDate(ticket.createdAt)} />
            <InfoRow label="Updated"   value={formatDate(ticket.updatedAt)} />
            <InfoRow label="Category"  value={CATEGORY_LABELS[ticket.category]} />
            <InfoRow label="Replies"   value={String(ticket.replies.length)} />
            {ticket.assignedTo && (
              <InfoRow label="Assigned to" value={ticket.assignedTo.name} />
            )}
          </div>

          {/* Update status / priority */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Update Ticket
            </p>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Status</label>
              <select
                value={selStatus} onChange={(e) => setSelStatus(e.target.value as TicketStatus)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Priority</label>
              <select
                value={selPriority} onChange={(e) => setSelPriority(e.target.value as TicketPriority)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">
                Internal Note <span className="text-slate-400 font-normal">(not shown to user)</span>
              </label>
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add an internal note…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
              ) : "Save Changes"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}