"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "helper/api";
import { format } from "date-fns";

// ─── types ────────────────────────────────────────────────────────────────────
interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  postedBy?: { user: { name: string } };
}

type NoticeType = "all" | "event" | "newsletter" | "alert" | "notification";

const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  event:        { label: "Event",        color: "bg-purple-100 text-purple-700", icon: "📅" },
  newsletter:   { label: "Newsletter",   color: "bg-blue-100 text-blue-700",     icon: "📰" },
  alert:        { label: "Alert",        color: "bg-red-100 text-red-600",       icon: "🚨" },
  notification: { label: "Notification", color: "bg-emerald-100 text-emerald-700", icon: "🔔" },
};

const EMPTY_FORM = { title: "", content: "", type: "notification" };

export default function SuperAdminNoticeBoard() {
  const params = useSearchParams();
  const typeParam = (params.get("type") ?? "all") as NoticeType;

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const q = typeParam !== "all" ? `?type=${typeParam}` : "";
    api.get(`/noticeboard${q}`)
      .then((r) => setNotices(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeParam]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(n: Notice) {
    setEditing(n);
    setForm({ title: n.title, content: n.content, type: n.type });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await api.patch(`/noticeboard/${editing.id}`, form);
      } else {
        await api.post("/noticeboard", form);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to save");
    } finally { setBusy(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/noticeboard/${id}`);
      setDeleteConfirm(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to delete");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage platform-wide notices and announcements</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> New Notice
        </button>
      </div>

      {/* Type tabs */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-0 overflow-x-auto">
          {(["all", "newsletter", "alert", "notification"] as NoticeType[]).map((t) => (
            <a key={t} href={`?type=${t}`}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors font-sans ${
                typeParam === t
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}>
              {t === "all" ? "All" : `${TYPE_META[t].icon} ${TYPE_META[t].label}`}
              {t !== "all" && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                  {notices.filter(n => n.type === t).length}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">

        {/* Create / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {editing ? "Edit Notice" : "Create New Notice"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-600">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Notice title"
                    className="input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input"
                  >
                    <option value="notification">🔔 Notification</option>
                    <option value="newsletter">📰 Newsletter</option>
                    <option value="alert">🚨 Alert</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Content *</label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={5}
                  placeholder="Write the full notice content here…"
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={busy}
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors">
                  {busy ? "Saving…" : editing ? "Save Changes" : "Publish Notice"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notices list */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-sans text-sm">No notices yet. Create one above.</p>
          </div>
        ) : (
          notices.map((n) => {
            const meta = TYPE_META[n.type] ?? { label: n.type, color: "bg-gray-100 text-gray-600", icon: "📌" };
            return (
              <div key={n.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Type badge + title */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-sans ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <h3 className="font-semibold text-gray-900 text-base">{n.title}</h3>
                    </div>
                    {/* Content preview */}
                    <p className="text-sm text-gray-500 font-sans line-clamp-2 mb-3">{n.content}</p>
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-sans">
                      <span>📅 {format(new Date(n.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                      {n.postedBy?.user?.name && (
                        <span>👤 {n.postedBy.user.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(n)}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-sans">
                      ✏️ Edit
                    </button>
                    {deleteConfirm === n.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(n.id)}
                          className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-sans">
                          Confirm
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-sans">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(n.id)}
                        className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-sans">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}