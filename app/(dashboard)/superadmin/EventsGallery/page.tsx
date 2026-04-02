// "use client";
// import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import api from "helper/api";
// import { format } from "date-fns";

// interface Event {
//   id: string; title: string; date: string; location?: string;
//   description?: string; category?: string; status?: string;
//   organization?: { name: string; logo?: string };
//   approvedBy?: string;
//   photos?: { id: string; fileUrl: string }[];
//   abstract?: { id: string; title: string; fileUrl: string } | null;
// }
// interface GalleryItem {
//   id: string; title: string; fileUrl: string; type: string;
//   uploadedAt: string; coeProfile?: { organization: { name: string } };
// }
// type Section = "pending" | "major" | "minor" | "past" | "gallery";

// function Badge({ label, color }: { label: string; color: string }) {
//   return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
// }

// export default function SuperAdminEventsGalleryPage() {
//   const params = useSearchParams();
//   const section = (params.get("section") ?? "pending") as Section;
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-6 py-5">
//         <h1 className="text-xl font-bold text-gray-900">Events & Gallery Management</h1>
//         <p className="text-sm text-gray-500 mt-0.5">Review requests, classify events, manage platform gallery</p>
//       </div>
//       <div className="bg-white border-b border-gray-100 px-6">
//         <div className="flex gap-1 overflow-x-auto">
//           {[
//             { key: "pending", label: "⏳ Pending" },
//             { key: "major",   label: "🔴 Major Events" },
//             { key: "minor",   label: "🔵 Minor Events" },
//             { key: "past",    label: "📁 Past Events" },
//             { key: "gallery", label: "🖼️ Gallery" },
//           ].map(({ key, label }) => (
//             <a key={key} href={`?section=${key}`}
//               className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
//                 section === key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}>
//               {label}
//             </a>
//           ))}
//         </div>
//       </div>
//       <div className="p-6 max-w-6xl mx-auto space-y-6">
//         {section === "pending" && <PendingRequests />}
//         {section === "major"   && <ApprovedEvents category="MAJOR" />}
//         {section === "minor"   && <ApprovedEvents category="MINOR" />}
//         {section === "past"    && <PastEvents />}
//         {section === "gallery" && <GallerySection />}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // PENDING REQUESTS
// // ═══════════════════════════════════════════════════════════════════════════════
// function PendingRequests() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [approving, setApproving] = useState<Record<string, { category: string }>>({});

//   const load = () => {
//     setLoading(true);
//     api.get("/events/pending").then((r) => setEvents(r.data)).finally(() => setLoading(false));
//   };
//   useEffect(load, []);

//   async function approve(id: string) {
//     const cat = approving[id]?.category ?? "MINOR";
//     try {
//       await api.patch(`/events/admin/approve/${id}`, { category: cat });
//       load();
//     } catch (err) { console.error(err); }
//   }
//   async function reject(id: string) {
//     if (!confirm("Reject and delete this event request?")) return;
//     await api.delete(`/events/admin/reject/${id}`);
//     load();
//   }

//   if (loading) return <Skeleton />;
//   return (
//     <div className="space-y-4">
//       <SectionHeader title="Pending Event Requests" count={events.length} />
//       {events.length === 0 ? (
//         <Empty message="No pending requests. All clear!" />
//       ) : events.map((e) => (
//         <div key={e.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
//           <div className="flex items-start justify-between flex-wrap gap-3">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 {e.organization?.logo && (
//                   <SafeImage
//                     src={e.organization.logo}
//                     className="w-6 h-6 rounded-full object-cover border border-gray-100"
//                   />
//                 )}
//                 <span className="text-xs text-gray-500">{e.organization?.name}</span>
//               </div>
//               <h3 className="font-semibold text-gray-900">{e.title}</h3>
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {format(new Date(e.date), "dd MMM yyyy, HH:mm")}
//                 {e.location && ` · ${e.location}`}
//               </p>
//               {e.description && <p className="text-sm text-gray-600 mt-2">{e.description}</p>}
//             </div>
//             <div className="flex flex-col gap-2 min-w-[160px]">
//               <label className="text-xs font-medium text-gray-600">Set Category</label>
//               <select
//                 value={approving[e.id]?.category ?? (e.category ?? "MINOR")}
//                 onChange={(v) => setApproving({ ...approving, [e.id]: { category: v.target.value } })}
//                 className="input text-sm"
//               >
//                 <option value="MINOR">🔵 Minor</option>
//                 <option value="MAJOR">🔴 Major</option>
//               </select>
//               <button onClick={() => approve(e.id)}
//                 className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
//                 ✓ Approve
//               </button>
//               <button onClick={() => reject(e.id)}
//                 className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
//                 ✗ Reject
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // APPROVED EVENTS
// // ═══════════════════════════════════════════════════════════════════════════════
// function ApprovedEvents({ category }: { category: "MAJOR" | "MINOR" }) {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState<string | null>(null);
//   const [editForm, setEditForm] = useState<any>({});

//   const load = () => {
//     setLoading(true);
//     api.get(`/events/approved?category=${category}`).then((r) => setEvents(r.data)).finally(() => setLoading(false));
//   };
//   useEffect(load, [category]);

//   async function saveEdit(id: string) {
//     await api.patch(`/events/admin/${id}`, editForm);
//     setEditing(null);
//     load();
//   }
//   async function deleteEvent(id: string) {
//     if (!confirm("Delete this event?")) return;
//     await api.delete(`/events/admin/${id}`);
//     load();
//   }
//   async function reclassify(id: string, newCategory: string) {
//     await api.patch(`/events/admin/${id}`, { category: newCategory });
//     load();
//   }

//   if (loading) return <Skeleton />;
//   return (
//     <div className="space-y-4">
//       <SectionHeader
//         title={category === "MAJOR" ? "🔴 Major Events" : "🔵 Minor Events"}
//         count={events.length}
//       />
//       {events.length === 0 ? (
//         <Empty message={`No ${category.toLowerCase()} events found.`} />
//       ) : events.map((e) => (
//         <div key={e.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
//           {editing === e.id ? (
//             <EditEventForm
//               form={editForm}
//               onChange={setEditForm}
//               onSave={() => saveEdit(e.id)}
//               onCancel={() => setEditing(null)}
//             />
//           ) : (
//             <div className="flex items-start justify-between flex-wrap gap-3">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   {e.organization?.logo && (
//                     <SafeImage
//                       src={e.organization.logo}
//                       className="w-6 h-6 rounded-full border border-gray-100"
//                     />
//                   )}
//                   <span className="text-xs text-gray-500">{e.organization?.name}</span>
//                   <Badge
//                     label={e.category ?? category}
//                     color={e.category === "MAJOR" ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}
//                   />
//                 </div>
//                 <h3 className="font-semibold text-gray-900">{e.title}</h3>
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   {format(new Date(e.date), "dd MMM yyyy, HH:mm")}
//                   {e.location && ` · ${e.location}`}
//                 </p>
//                 {e.description && <p className="text-sm text-gray-600 mt-2">{e.description}</p>}
//               </div>
//               <div className="flex flex-col gap-2 min-w-[140px]">
//                 <button
//                   onClick={() => {
//                     setEditing(e.id);
//                     setEditForm({ title: e.title, date: e.date, location: e.location, description: e.description, category: e.category });
//                   }}
//                   className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
//                   ✏️ Edit
//                 </button>
//                 <button
//                   onClick={() => reclassify(e.id, e.category === "MAJOR" ? "MINOR" : "MAJOR")}
//                   className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
//                   ⇄ Move to {e.category === "MAJOR" ? "Minor" : "Major"}
//                 </button>
//                 <button
//                   onClick={() => deleteEvent(e.id)}
//                   className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
//                   🗑️ Delete
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // PAST EVENTS — read-only with photos + abstract
// // ═══════════════════════════════════════════════════════════════════════════════
// function PastEvents() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.get("/events/public/past").then((r) => setEvents(r.data)).finally(() => setLoading(false));
//   }, []);

//   if (loading) return <Skeleton />;
//   return (
//     <div className="space-y-4">
//       <SectionHeader title="Past Events" count={events.length} />
//       {events.length === 0 ? (
//         <Empty message="No past events yet." />
//       ) : events.map((e) => (
//         <div key={e.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
//           <div className="flex items-start justify-between flex-wrap gap-2">
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 {e.organization?.logo && (
//                   <SafeImage
//                     src={e.organization.logo}
//                     className="w-6 h-6 rounded-full border border-gray-100"
//                   />
//                 )}
//                 <span className="text-xs text-gray-500">{e.organization?.name}</span>
//                 <Badge
//                   label={e.category ?? "MINOR"}
//                   color={e.category === "MAJOR" ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}
//                 />
//               </div>
//               <h3 className="font-semibold text-gray-900">{e.title}</h3>
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {format(new Date(e.date), "dd MMM yyyy")}
//                 {e.location && ` · ${e.location}`}
//               </p>
//             </div>
//           </div>

//           {(e.photos?.length ?? 0) > 0 && (
//             <div className="flex gap-3 flex-wrap">
//               {e.photos?.map((p) => (
//                 <SafeImage
//                   key={p.id}
//                   src={p.fileUrl}
//                   className="w-24 h-20 rounded-lg object-cover border border-gray-200"
//                 />
//               ))}
//             </div>
//           )}

//           {e.abstract && (
//             <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 p-3">
//               <p className="text-sm font-medium text-gray-800">📄 {e.abstract.title}</p>
//               <a
//                 href={e.abstract.fileUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
//               >
//                 View Abstract
//               </a>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // LIGHTBOX MODAL — full-screen preview for image / video / doc
// // ═══════════════════════════════════════════════════════════════════════════════
// function ViewModal({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
//   // Close on Escape key
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [onClose]);

//   return (
//     <div
//       className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
//       onClick={onClose}
//     >
//       <div
//         className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
//           <div>
//             <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
//             {item.coeProfile?.organization?.name && (
//               <p className="text-[11px] text-gray-400">{item.coeProfile.organization.name}</p>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors text-lg leading-none"
//           >
//             ×
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4 min-h-[300px]">
//           {item.type === "image" ? (
//             <img
//               src={item.fileUrl}
//               alt={item.title}
//               className="max-w-full max-h-[65vh] rounded-lg object-contain shadow"
//             />
//           ) : item.type === "video" ? (
//             <video
//               src={item.fileUrl}
//               controls
//               autoPlay
//               className="max-w-full max-h-[65vh] rounded-lg shadow"
//             />
//           ) : (
//             // Doc — open-in-tab button
//             <div className="flex flex-col items-center gap-4 py-8">
//               <span className="text-6xl">📄</span>
//               <p className="text-gray-600 text-sm">{item.title}</p>
//               <a
//                 href={item.fileUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
//               >
//                 Open Document ↗
//               </a>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
//           <p className="text-[11px] text-gray-400">
//             {format(new Date(item.uploadedAt), "dd MMM yyyy, HH:mm")}
//           </p>
//           <a
//             href={item.fileUrl}
//             target="_blank"
//             rel="noreferrer"
//             className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//           >
//             Open in new tab ↗
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // GALLERY — platform-wide view + delete
// // ═══════════════════════════════════════════════════════════════════════════════
// function GallerySection() {
//   const [items, setItems] = useState<GalleryItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeType, setActiveType] = useState("all");
//   const [viewing, setViewing] = useState<GalleryItem | null>(null);  // ← NEW

//   const load = () => {
//     setLoading(true);
//     // ✅ Backend returns fresh presigned URLs on every fetch
//     api.get("/gallery/public/all").then((r) => setItems(r.data)).finally(() => setLoading(false));
//   };
//   useEffect(load, []);

//   async function remove(id: string) {
//     if (!confirm("Delete this gallery item?")) return;
//     await api.delete(`/gallery/admin/${id}`);
//     setViewing(null); // close modal if the deleted item was open
//     load();
//   }

//   const filtered = activeType === "all" ? items : items.filter((i) => i.type === activeType);

//   if (loading) return <Skeleton />;
//   return (
//     <>
//       {/* Lightbox modal */}
//       {viewing && <ViewModal item={viewing} onClose={() => setViewing(null)} />}

//       <div className="space-y-5">
//         <SectionHeader title="Platform Gallery" count={items.length} />
//         <div className="flex gap-2 flex-wrap">
//           {["all", "image", "video", "doc"].map((t) => (
//             <button key={t} onClick={() => setActiveType(t)}
//               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
//                 activeType === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
//               }`}>
//               {t === "all" ? "All" : t === "image" ? "🖼️ Images" : t === "video" ? "🎬 Videos" : "📄 Docs"}
//             </button>
//           ))}
//         </div>
//         {filtered.length === 0 ? (
//           <Empty message="No gallery items found." />
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//             {filtered.map((item) => (
//               <div key={item.id} className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
//                 {item.type === "image" ? (
//                   <SafeImage src={item.fileUrl} alt={item.title} className="w-full h-32 object-cover" />
//                 ) : item.type === "video" ? (
//                   <video src={item.fileUrl} className="w-full h-32 object-cover" muted playsInline />
//                 ) : (
//                   <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-3xl">📄</div>
//                 )}
//                 <div className="p-2">
//                   <p className="text-xs font-medium text-gray-700 truncate">{item.title}</p>
//                   <p className="text-[10px] text-gray-400 truncate">{item.coeProfile?.organization?.name}</p>
//                 </div>
//                 {/* Hover overlay */}
//                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
//                   {/* ✅ View now opens the lightbox modal instead of navigating away */}
//                   <button
//                     onClick={() => setViewing(item)}
//                     className="text-xs px-2 py-1 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
//                   >
//                     👁 View
//                   </button>
//                   <button
//                     onClick={() => remove(item.id)}
//                     className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                   >
//                     🗑 Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // ─── edit form ────────────────────────────────────────────────────────────────
// function EditEventForm({ form, onChange, onSave, onCancel }: any) {
//   const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
//     .toISOString()
//     .slice(0, 16);

//   const inputDateValue = form.date ? new Date(form.date).toISOString().slice(0, 16) : "";

//   return (
//     <div className="space-y-3">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <input value={form.title ?? ""} onChange={(e) => onChange({ ...form, title: e.target.value })}
//           placeholder="Title" className="input" />
//         <div>
//           <input
//             type="datetime-local"
//             value={inputDateValue}
//             min={minDateTime}
//             step="60"
//             onChange={(e) => onChange({ ...form, date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
//             className="input"
//           />
//           {inputDateValue && (
//             <p className="text-[11px] text-gray-400 mt-1">
//               📅 {format(new Date(inputDateValue), "dd MMM yyyy 'at' hh:mm a")}
//             </p>
//           )}
//         </div>
//         <input value={form.location ?? ""} onChange={(e) => onChange({ ...form, location: e.target.value })}
//           placeholder="Location" className="input" />
//         <select value={form.category ?? "MINOR"} onChange={(e) => onChange({ ...form, category: e.target.value })}
//           className="input">
//           <option value="MINOR">🔵 Minor</option>
//           <option value="MAJOR">🔴 Major</option>
//         </select>
//       </div>
//       <textarea value={form.description ?? ""} onChange={(e) => onChange({ ...form, description: e.target.value })}
//         rows={2} className="input resize-none w-full" placeholder="Description" />
//       <div className="flex gap-2">
//         <button onClick={onSave} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Save</button>
//         <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">Cancel</button>
//       </div>
//     </div>
//   );
// }

// // ─── SafeImage — graceful fallback if presigned URL expires before render ─────
// function SafeImage({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
//   const [errored, setErrored] = useState(false);
//   if (errored) {
//     return <div className={`bg-gray-100 flex items-center justify-center text-gray-300 text-xs ${className}`}>—</div>;
//   }
//   return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />;
// }

// // ─── shared ───────────────────────────────────────────────────────────────────
// function SectionHeader({ title, count }: { title: string; count?: number }) {
//   return (
//     <div className="flex items-center gap-3 mb-1">
//       <h2 className="text-base font-semibold text-gray-900">{title}</h2>
//       {count !== undefined && (
//         <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{count}</span>
//       )}
//       <div className="flex-1 h-px bg-gray-100" />
//     </div>
//   );
// }
// function Empty({ message }: { message: string }) {
//   return <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">{message}</div>;
// }
// function Skeleton() {
//   return (
//     <div className="space-y-3 animate-pulse">
//       {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
//     </div>
//   );
// }
"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "helper/api";
import { format } from "date-fns";

interface Event {
  id: string; title: string; date: string; location?: string;
  description?: string; category?: string; status?: string;
  organization?: { name: string; logo?: string };
  approvedBy?: string;
  photos?: { id: string; fileUrl: string }[];
  abstract?: { id: string; title: string; fileUrl: string } | null;
}

interface GalleryItem {
  id: string;
  title: string;
  fileUrl: string;
  type: string;
  uploadedAt: string;
  status: "PRIVATE" | "PENDING_APPROVAL" | "APPROVED";
  coeProfile?: {
    organization: { id: string; name: string; logo?: string };
  };
}

type Section = "pending" | "major" | "minor" | "past" | "gallery";
type GalleryTab = "pending" | "coe" | "portal";

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
}

function SafeImage({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <div className={`bg-gray-100 flex items-center justify-center text-gray-300 text-xs ${className}`}>—</div>;
  }
  return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />;
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

function Empty({ message }: { message: string }) {
  return <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">{message}</div>;
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function SuperAdminEventsGalleryPage() {
  const params = useSearchParams();
  const section = (params.get("section") ?? "pending") as Section;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">Events & Gallery Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review requests, classify events, manage platform gallery</p>
      </div>
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: "pending", label: "⏳ Pending" },
            { key: "major",   label: "🔴 Major Events" },
            { key: "minor",   label: "🔵 Minor Events" },
            { key: "past",    label: "📁 Past Events" },
            { key: "gallery", label: "🖼️ Gallery" },
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
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {section === "pending" && <PendingRequests />}
        {section === "major"   && <ApprovedEvents category="MAJOR" />}
        {section === "minor"   && <ApprovedEvents category="MINOR" />}
        {section === "past"    && <PastEvents />}
        {section === "gallery" && <GallerySection />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PENDING EVENT REQUESTS
// ═══════════════════════════════════════════════════════════════════════════════
function PendingRequests() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<Record<string, { category: string }>>({});

  const load = () => {
    setLoading(true);
    api.get("/events/pending").then((r) => setEvents(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function approve(id: string) {
    const cat = approving[id]?.category ?? "MINOR";
    try {
      await api.patch(`/events/admin/approve/${id}`, { category: cat });
      load();
    } catch (err) { console.error(err); }
  }

  async function reject(id: string) {
    if (!confirm("Reject and delete this event request?")) return;
    await api.delete(`/events/admin/reject/${id}`);
    load();
  }

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <SectionHeader title="Pending Event Requests" count={events.length} />
      {events.length === 0 ? (
        <Empty message="No pending requests. All clear!" />
      ) : events.map((e) => (
        <div key={e.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {e.organization?.logo && (
                  <SafeImage src={e.organization.logo} className="w-6 h-6 rounded-full object-cover border border-gray-100" />
                )}
                <span className="text-xs text-gray-500">{e.organization?.name}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{e.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {format(new Date(e.date), "dd MMM yyyy, HH:mm")}
                {e.location && ` · ${e.location}`}
              </p>
              {e.description && <p className="text-sm text-gray-600 mt-2">{e.description}</p>}
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium text-gray-600">Set Category</label>
              <select
                value={approving[e.id]?.category ?? (e.category ?? "MINOR")}
                onChange={(v) => setApproving({ ...approving, [e.id]: { category: v.target.value } })}
                className="input text-sm"
              >
                <option value="MINOR">🔵 Minor</option>
                <option value="MAJOR">🔴 Major</option>
              </select>
              <button onClick={() => approve(e.id)}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                ✓ Approve
              </button>
              <button onClick={() => reject(e.id)}
                className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPROVED EVENTS
// ═══════════════════════════════════════════════════════════════════════════════
function ApprovedEvents({ category }: { category: "MAJOR" | "MINOR" }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const load = () => {
    setLoading(true);
    api.get(`/events/approved?category=${category}`).then((r) => setEvents(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, [category]);

  async function saveEdit(id: string) {
    await api.patch(`/events/admin/${id}`, editForm);
    setEditing(null);
    load();
  }
  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/admin/${id}`);
    load();
  }
  async function reclassify(id: string, newCategory: string) {
    await api.patch(`/events/admin/${id}`, { category: newCategory });
    load();
  }

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <SectionHeader
        title={category === "MAJOR" ? "🔴 Major Events" : "🔵 Minor Events"}
        count={events.length}
      />
      {events.length === 0 ? (
        <Empty message={`No ${category.toLowerCase()} events found.`} />
      ) : events.map((e) => (
        <div key={e.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          {editing === e.id ? (
            <EditEventForm
              form={editForm}
              onChange={setEditForm}
              onSave={() => saveEdit(e.id)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {e.organization?.logo && (
                    <SafeImage src={e.organization.logo} className="w-6 h-6 rounded-full border border-gray-100" />
                  )}
                  <span className="text-xs text-gray-500">{e.organization?.name}</span>
                  <Badge
                    label={e.category ?? category}
                    color={e.category === "MAJOR" ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{e.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {format(new Date(e.date), "dd MMM yyyy, HH:mm")}
                  {e.location && ` · ${e.location}`}
                </p>
                {e.description && <p className="text-sm text-gray-600 mt-2">{e.description}</p>}
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <button
                  onClick={() => {
                    setEditing(e.id);
                    setEditForm({ title: e.title, date: e.date, location: e.location, description: e.description, category: e.category });
                  }}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  ✏️ Edit
                </button>
                <button
                  onClick={() => reclassify(e.id, e.category === "MAJOR" ? "MINOR" : "MAJOR")}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  ⇄ Move to {e.category === "MAJOR" ? "Minor" : "Major"}
                </button>
                <button
                  onClick={() => deleteEvent(e.id)}
                  className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAST EVENTS
// ═══════════════════════════════════════════════════════════════════════════════
function PastEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // Use admin endpoint so we get all data + can delete
    api.get("/events/approved")
      .then((r) => {
        const past = r.data.filter((e: Event) => new Date(e.date) < new Date());
        // Sort newest first
        past.sort((a: Event, b: Event) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(past);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function deleteEvent(id: string) {
    if (!confirm("Permanently delete this past event and all its content?")) return;
    try {
      await api.delete(`/events/admin/${id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Delete failed");
    }
  }

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <SectionHeader title="Past Events" count={events.length} />
      {events.length === 0 ? (
        <Empty message="No past events yet." />
      ) : events.map((e) => (
        <div key={e.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {e.organization?.logo && (
                  <SafeImage src={e.organization.logo} className="w-6 h-6 rounded-full border border-gray-100" />
                )}
                <span className="text-xs text-gray-500">{e.organization?.name}</span>
                <Badge
                  label={e.category ?? "MINOR"}
                  color={e.category === "MAJOR" ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}
                />
              </div>
              <h3 className="font-semibold text-gray-900">{e.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {format(new Date(e.date), "dd MMM yyyy")}
                {e.location && ` · ${e.location}`}
              </p>
            </div>
            {/* ← NEW delete button */}
            <button
              onClick={() => deleteEvent(e.id)}
              className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors self-start"
            >
              🗑️ Delete
            </button>
          </div>
        {(e.photos?.length ?? 0) > 0 && (
  <div className={`grid gap-3 ${(e.photos?.length ?? 1) >= 2 ? "grid-cols-2" : "grid-cols-1"}`}>
    {e.photos?.map((p) => (
      <div key={p.id} className="rounded-xl overflow-hidden border border-gray-200 aspect-video">
        <SafeImage src={p.fileUrl} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
)}
          {e.abstract && (
           <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 p-3">
    <p className="text-sm font-medium text-gray-800 truncate">📄 {e.abstract.title}</p>
              <a href={e.abstract.fileUrl} target="_blank" rel="noreferrer"
                  className="shrink-0 ml-3 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors">
                View Abstract
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTBOX MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ViewModal({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
            {item.coeProfile?.organization?.name && (
              <p className="text-[11px] text-gray-400">{item.coeProfile.organization.name}</p>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4 min-h-[300px]">
          {item.type === "image" ? (
            <img src={item.fileUrl} alt={item.title} className="max-w-full max-h-[65vh] rounded-lg object-contain shadow" />
          ) : item.type === "video" ? (
            <video src={item.fileUrl} controls autoPlay className="max-w-full max-h-[65vh] rounded-lg shadow" />
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="text-6xl">📄</span>
              <p className="text-gray-600 text-sm">{item.title}</p>
              <a href={item.fileUrl} target="_blank" rel="noreferrer"
                className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                Open Document ↗
              </a>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">{format(new Date(item.uploadedAt), "dd MMM yyyy, HH:mm")}</p>
          <a href={item.fileUrl} target="_blank" rel="noreferrer"
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Open in new tab ↗
          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY SECTION — 3 tabs: Pending Requests / CoE Galleries / Portal Gallery
// ═══════════════════════════════════════════════════════════════════════════════
function GallerySection() {
  const [tab, setTab] = useState<GalleryTab>("pending");

  return (
    <div className="space-y-5">
      <SectionHeader title="Gallery Management" />
      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "pending", label: "⏳ Pending Requests" },
          { key: "coe",     label: "🏢 CoE Galleries" },
          { key: "portal",  label: "🌐 Portal Gallery" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as GalleryTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "pending" && <PendingGalleryRequests />}
      {tab === "coe"     && <CoeGalleries />}
      {tab === "portal"  && <PortalGallery />}
    </div>
  );
}

// ─── Pending Gallery Requests ─────────────────────────────────────────────────
function PendingGalleryRequests() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    // ✅ new endpoint
    api.get("/gallery/admin/pending").then((r) => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function approve(id: string) {
    setProcessing(id);
    try {
      await api.post(`/gallery/admin/approve/${id}`);
      load();
    } finally { setProcessing(null); }
  }

  async function reject(id: string) {
    setProcessing(id);
    try {
      await api.post(`/gallery/admin/reject/${id}`);
      load();
    } finally { setProcessing(null); }
  }

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-700">Portal Upload Requests</p>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{items.length} pending</span>
      </div>
      {items.length === 0 ? (
        <Empty message="No pending gallery requests. All clear!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden flex flex-col">
              {/* Thumbnail */}
              <div className="relative w-full h-48 bg-gray-100">
                {item.type === "image" ? (
                  <SafeImage src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : item.type === "video" ? (
                  <video src={item.fileUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📄</div>
                )}
                <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-white">
                  Pending
                </span>
              </div>
              {/* Info + Actions */}
              <div className="p-3 flex-1 flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                <div className="flex items-center gap-2">
                  {item.coeProfile?.organization?.logo && (
                    <SafeImage src={item.coeProfile.organization.logo} className="w-5 h-5 rounded-full border border-gray-100" />
                  )}
                  <span className="text-[11px] text-gray-500 truncate">{item.coeProfile?.organization?.name}</span>
                </div>
                <p className="text-[10px] text-gray-400">{format(new Date(item.uploadedAt), "dd MMM yyyy")}</p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => approve(item.id)} disabled={processing === item.id}
                    className="flex-1 text-xs py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                    ✓ Approve
                  </button>
                  <button onClick={() => reject(item.id)} disabled={processing === item.id}
                    className="flex-1 text-xs py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors">
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CoE Galleries (PRIVATE + PENDING) ───────────────────────────────────────
function CoeGalleries() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoe, setSelectedCoe] = useState<string>("all");

  const load = () => {
    setLoading(true);
    // ✅ new endpoint
    api.get("/gallery/admin/coe-galleries").then((r) => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  // Unique CoEs from items
  const coes = Array.from(
    new Map(items.map((i) => [
      i.coeProfile?.organization?.name,
      { name: i.coeProfile?.organization?.name ?? "", logo: i.coeProfile?.organization?.logo }
    ])).entries()
  );

  const filtered = selectedCoe === "all"
    ? items
    : items.filter((i) => i.coeProfile?.organization?.name === selectedCoe);

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      {/* CoE filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedCoe("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            selectedCoe === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600"
          }`}>
          All CoEs ({items.length})
        </button>
        {coes.map(([name, info]) => (
          <button key={name} onClick={() => setSelectedCoe(name ?? "")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedCoe === name ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600"
            }`}>
            {info.logo && <SafeImage src={info.logo} className="w-4 h-4 rounded-full" />}
            {name}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Private</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Pending Approval</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> On Portal</span>
      </div>

      {filtered.length === 0 ? (
        <Empty message="No CoE gallery items found." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="relative w-full h-48 bg-gray-100">
                {item.type === "image" ? (
                  <SafeImage src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : item.type === "video" ? (
                  <video src={item.fileUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📄</div>
                )}
                {/* Status badge */}
                <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${
                  item.status === "APPROVED" ? "bg-emerald-500" :
                  item.status === "PENDING_APPROVAL" ? "bg-amber-400" : "bg-gray-400"
                }`}>
                  {item.status === "APPROVED" ? "Portal" : item.status === "PENDING_APPROVAL" ? "Pending" : "Private"}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {item.coeProfile?.organization?.logo && (
                    <SafeImage src={item.coeProfile.organization.logo} className="w-4 h-4 rounded-full" />
                  )}
                  <span className="text-[10px] text-gray-500">{item.coeProfile?.organization?.name}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{format(new Date(item.uploadedAt), "dd MMM yyyy")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Portal Gallery (APPROVED only) ──────────────────────────────────────────
function PortalGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [viewing, setViewing] = useState<GalleryItem | null>(null);

  const load = () => {
    setLoading(true);
    // ✅ public endpoint — only APPROVED items
    api.get("/gallery/public/all").then((r) => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function remove(id: string) {
    if (!confirm("Remove this item from the portal?")) return;
    await api.delete(`/gallery/admin/${id}`);
    setViewing(null);
    load();
  }

  const filtered = activeType === "all" ? items : items.filter((i) => i.type === activeType);

  if (loading) return <Skeleton />;
  return (
    <>
      {viewing && <ViewModal item={viewing} onClose={() => setViewing(null)} />}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">Portal Gallery</p>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{items.length} approved</span>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 flex-wrap">
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
          <Empty message="No approved portal items yet." />
        ) : (
<div className="grid grid-cols-3 gap-4">            {filtered.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="relative w-full h-48 bg-gray-100">
                  {item.type === "image" ? (
                    <SafeImage src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : item.type === "video" ? (
                    <video src={item.fileUrl} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📄</div>
                  )}
               

{/* Replace the <div className="p-3"> card footer with this: */}
<div className="p-3">
  <p className="text-sm font-medium text-gray-700 truncate">{item.title}</p>
  <div className="flex items-center gap-1.5 mt-1">
    {item.coeProfile?.organization?.logo && (
      <SafeImage src={item.coeProfile.organization.logo} className="w-4 h-4 rounded-full" />
    )}
    <span className="text-[10px] text-gray-500 truncate">{item.coeProfile?.organization?.name}</span>
  </div>
</div>

{/* Always-visible action bar */}
<div className="flex gap-2 px-3 pb-3 pt-0 border-t border-gray-100 mt-1">
  <button
    onClick={() => setViewing(item)}
    className="flex-1 text-xs py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
  >
    View
  </button>
  <button
    onClick={() => remove(item.id)}
    className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
  >
    Remove
  </button>
</div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-700 truncate">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.coeProfile?.organization?.logo && (
                      <SafeImage src={item.coeProfile.organization.logo} className="w-4 h-4 rounded-full" />
                    )}
                    <span className="text-[10px] text-gray-500 truncate">{item.coeProfile?.organization?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Edit Event Form ──────────────────────────────────────────────────────────
function EditEventForm({ form, onChange, onSave, onCancel }: any) {
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);
  const inputDateValue = form.date ? new Date(form.date).toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={form.title ?? ""} onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="Title" className="input" />
        <div>
          <input type="datetime-local" value={inputDateValue} min={minDateTime} step="60"
            onChange={(e) => onChange({ ...form, date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
            className="input" />
          {inputDateValue && (
            <p className="text-[11px] text-gray-400 mt-1">
              📅 {format(new Date(inputDateValue), "dd MMM yyyy 'at' hh:mm a")}
            </p>
          )}
        </div>
        <input value={form.location ?? ""} onChange={(e) => onChange({ ...form, location: e.target.value })}
          placeholder="Location" className="input" />
        <select value={form.category ?? "MINOR"} onChange={(e) => onChange({ ...form, category: e.target.value })}
          className="input">
          <option value="MINOR">🔵 Minor</option>
          <option value="MAJOR">🔴 Major</option>
        </select>
      </div>
      <textarea value={form.description ?? ""} onChange={(e) => onChange({ ...form, description: e.target.value })}
        rows={2} className="input resize-none w-full" placeholder="Description" />
      <div className="flex gap-2">
        <button onClick={onSave} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Save</button>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">Cancel</button>
      </div>
    </div>
  );
}
