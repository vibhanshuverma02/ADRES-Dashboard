"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "helper/api";
import { format, isPast, formatDistanceToNow } from "date-fns";

// ─── types ────────────────────────────────────────────────────────────────────
interface Event {
  id: string; title: string; date: string; location?: string;
  description?: string; category?: string; status: "PENDING" | "APPROVED";
  approvedBy?: string;
  photos?: { id: string; fileUrl: string }[];
  abstract?: { id: string; title: string; fileUrl: string; summary?: string } | null;
}
interface GalleryItem {
  id: string; title: string; fileUrl: string; type: string; uploadedAt: string;
}
type Section = "upcoming" | "request" | "past" | "gallery";

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
}

export default function CoEEventsGalleryPage() {
  const params = useSearchParams();
  const section = (params.get("section") ?? "upcoming") as Section;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">Events & Gallery</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your CoE events and media gallery</p>
      </div>
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: "upcoming", label: "📅 Upcoming" },
            { key: "request",  label: "➕ Request Event" },
            { key: "past",     label: "📁 Past Events" },
            { key: "gallery",  label: "🖼️ Gallery" },
          ].map(({ key, label }) => (
            <a key={key} href={`?section=${key}`}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                section === key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {section === "upcoming" && <UpcomingEvents />}
        {section === "request"  && <RequestEventForm />}
        {section === "past"     && <PastEvents />}
        {section === "gallery"  && <GalleryManager />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPCOMING EVENTS
// ═══════════════════════════════════════════════════════════════════════════════
function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events/my").then((r) => {
      setEvents(r.data.filter((e: Event) => !isPast(new Date(e.date))));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <SectionHeader title="Upcoming Events" count={events.length} />
      {events.length === 0 ? (
        <Empty message="No upcoming events. Use 'Request Event' to submit one." />
      ) : events.map((e) => <EventCard key={e.id} event={e} />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST EVENT FORM
// ═══════════════════════════════════════════════════════════════════════════════
function RequestEventForm() {
  const [form, setForm] = useState({ title: "", date: "", location: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) { alert("Please select a date and time"); return; }
    setBusy(true);
    try {
      await api.post("/events/request", {
        ...form,
        date: new Date(form.date).toISOString(),
      });
      setSuccess(true);
      setForm({ title: "", date: "", location: "", description: "" });
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to submit request");
    } finally { setBusy(false); }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <SectionHeader title="Request New Event" />
      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
          ✅ Event request submitted! SuperAdmin will review it shortly.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Event Title *">
            <input required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input" placeholder="e.g. Annual Research Summit" />
          </Field>
          <Field label="Date & Time *">
            <input required type="datetime-local" value={form.date}
              min={minDateTime} step="60"
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input" />
            {form.date && (
              <p className="text-[11px] text-gray-400 mt-1">
                📅 {format(new Date(form.date), "dd MMM yyyy 'at' hh:mm a")}
              </p>
            )}
          </Field>
          <Field label="Location">
            <input value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input" placeholder="City / Venue / Online" />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="input resize-none"
            placeholder="Brief description of the event..." />
        </Field>
        <button type="submit" disabled={busy}
          className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors">
          {busy ? "Submitting…" : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAST EVENTS — attach photos + abstract
// ═══════════════════════════════════════════════════════════════════════════════
function PastEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // ✅ Backend enriches all fileUrls with fresh presigned URLs on every call
    api.get("/events/my/past").then((r) => setEvents(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <SectionHeader title="Past Events" count={events.length} />
      {events.length === 0 ? (
        <Empty message="No past events yet." />
      ) : events.map((e) => <PastEventCard key={e.id} event={e} onRefresh={load} />)}
    </div>
  );
}

function PastEventCard({ event, onRefresh }: { event: Event; onRefresh: () => void }) {
  const photoRef = useRef<HTMLInputElement>(null);
  const abstractRef = useRef<HTMLInputElement>(null);
  const [abstractTitle, setAbstractTitle] = useState("");
  const [abstractSummary, setAbstractSummary] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadPhoto(file: File) {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/events/my/${event.id}/photos`, fd);
      onRefresh(); // ✅ re-fetch gives fresh presigned URLs
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Upload failed");
    } finally { setBusy(false); }
  }

  async function removePhoto(photoId: string) {
    if (!confirm("Remove this photo?")) return;
    await api.delete(`/events/my/photos/${photoId}`);
    onRefresh();
  }

  async function uploadAbstract(file: File) {
    if (!abstractTitle.trim()) { alert("Please enter a title for the abstract"); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", abstractTitle);
    if (abstractSummary) fd.append("summary", abstractSummary);
    try {
      await api.post(`/events/my/${event.id}/abstract`, fd);
      setAbstractTitle("");
      setAbstractSummary("");
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setBusy(false); }
  }

  async function removeAbstract() {
    if (!confirm("Remove abstract?")) return;
    await api.delete(`/events/my/${event.id}/abstract`);
    onRefresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(new Date(event.date), "dd MMM yyyy")}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
        <Badge
          label={event.category ?? "MINOR"}
          color={event.category === "MAJOR" ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-600"}
        />
      </div>

      {/* Photos */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">
          📷 Event Photos ({event.photos?.length ?? 0}/2)
        </p>
        <div className="flex gap-3 flex-wrap">
          {event.photos?.map((p) => (
            <div key={p.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              {/* ✅ presigned URL — valid when fetched, show graceful fallback on error */}
              <SafeImage src={p.fileUrl} className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(p.id)}
                className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                Remove
              </button>
            </div>
          ))}
          {(event.photos?.length ?? 0) < 2 && (
            <button onClick={() => photoRef.current?.click()} disabled={busy}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors text-xs gap-1">
              <span className="text-2xl">+</span>
              <span>Photo</span>
            </button>
          )}
        </div>
        <input ref={photoRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
      </div>

      {/* Abstract */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">📄 Abstract / Report</p>
        {event.abstract ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{event.abstract.title}</p>
              {event.abstract.summary && (
                <p className="text-xs text-gray-500 mt-0.5">{event.abstract.summary}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0 ml-3">
              {/* ✅ presigned URL — opens doc in new tab */}
              <a href={event.abstract.fileUrl} target="_blank" rel="noreferrer"
                className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                View
              </a>
              <button onClick={removeAbstract}
                className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={abstractTitle} onChange={(e) => setAbstractTitle(e.target.value)}
                placeholder="Abstract title *" className="input text-sm" />
              <input value={abstractSummary} onChange={(e) => setAbstractSummary(e.target.value)}
                placeholder="Short summary (optional)" className="input text-sm" />
            </div>
            <button onClick={() => abstractRef.current?.click()} disabled={busy}
              className="text-sm px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors w-full">
              + Attach Abstract (PDF / Word)
            </button>
            <input ref={abstractRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAbstract(e.target.files[0])} />
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"image" | "video" | "doc">("image");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    // ✅ Each fetch returns fresh presigned URLs
    api.get("/gallery/my").then((r) => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function upload(file: File) {
    if (!title.trim()) { alert("Please enter a title first"); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("type", type);
    try {
      await api.post("/gallery/my", fd);
      setTitle("");
      load(); // re-fetch so new item has a fresh presigned URL too
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Upload failed");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/gallery/my/${id}`);
    load();
  }

  const filtered = activeType === "all" ? items : items.filter((i) => i.type === activeType);
  const accept = type === "image" ? "image/*" : type === "video" ? "video/*" : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-5">
      {/* Upload panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader title="Upload to Gallery" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Item title *" className="input" />
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="input">
            <option value="image">🖼️ Image</option>
            <option value="video">🎬 Video</option>
            <option value="doc">📄 Document</option>
          </select>
          <button onClick={() => fileRef.current?.click()} disabled={busy}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors">
            {busy ? "Uploading…" : "Choose & Upload"}
          </button>
        </div>
        <input ref={fileRef} type="file" accept={accept} className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "image", "video", "doc"].map((t) => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeType === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {t === "all" ? "All" : t === "image" ? "🖼️ Images" : t === "video" ? "🎬 Videos" : "📄 Docs"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty message="No items yet. Upload something!" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <GalleryCard key={item.id} item={item} onDelete={() => remove(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryCard({ item, onDelete }: { item: GalleryItem; onDelete: () => void }) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {item.type === "image" ? (
        <SafeImage src={item.fileUrl} alt={item.title} className="w-full h-32 object-cover" />
      ) : item.type === "video" ? (
        <video src={item.fileUrl} className="w-full h-32 object-cover" muted playsInline />
      ) : (
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-3xl">📄</div>
      )}
      <div className="p-2">
        <p className="text-xs font-medium text-gray-700 truncate">{item.title}</p>
        <p className="text-[10px] text-gray-400">
          {formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true })}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <a href={item.fileUrl} target="_blank" rel="noreferrer"
          className="text-xs px-2 py-1 bg-white text-gray-800 rounded-lg">View</a>
        <button onClick={onDelete} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg">Delete</button>
      </div>
    </div>
  );
}

// ─── SafeImage — graceful fallback if a presigned URL has expired ─────────────
function SafeImage({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-300 text-xs ${className}`}>
        —
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />;
}

// ─── shared ───────────────────────────────────────────────────────────────────
function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(new Date(event.date), "dd MMM yyyy, HH:mm")}
            {event.location && ` · ${event.location}`}
          </p>
          {event.description && <p className="text-sm text-gray-600 mt-2">{event.description}</p>}
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge
            label={event.status}
            color={event.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}
          />
          {event.category && (
            <Badge
              label={event.category}
              color={event.category === "MAJOR" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-600"}
            />
          )}
        </div>
      </div>
      {event.approvedBy && <p className="text-xs text-gray-400 mt-2">Approved by {event.approvedBy}</p>}
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {count !== undefined && (
        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{count}</span>
      )}
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
      {message}
    </div>
  );
}
function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
    </div>
  );
}