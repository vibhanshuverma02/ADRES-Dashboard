"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "helper/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Org {
  id: string; name: string; logo?: string; type?: string;
}
interface Member {
  id: string;
  researcher: { user: { id: string; name: string; email: string } };
}
interface Cluster {
  id: string;
  name: string;
  lead?: { id: string; name: string; email: string } | null;
  assignedBy?: { user: { name: string } };
  organizations: { organization: Org }[];
  members: Member[];
  _count: { outputs: number; activities: number };
}

type Panel = "list" | "create" | "detail";

// ─── Colour palette per cluster index ────────────────────────────────────────
const PALETTE = [
  { bg: "bg-violet-50",  border: "border-violet-200", accent: "bg-violet-500",  text: "text-violet-700"  },
  { bg: "bg-sky-50",     border: "border-sky-200",    accent: "bg-sky-500",     text: "text-sky-700"     },
  { bg: "bg-emerald-50", border: "border-emerald-200",accent: "bg-emerald-500", text: "text-emerald-700" },
  { bg: "bg-amber-50",   border: "border-amber-200",  accent: "bg-amber-500",   text: "text-amber-700"   },
  { bg: "bg-rose-50",    border: "border-rose-200",   accent: "bg-rose-500",    text: "text-rose-700"    },
];

export default function ThematicClustersPage() {
  const params  = useSearchParams();
  const action  = params.get("action"); // "create" | "assign" | null

  const [clusters, setClusters]       = useState<Cluster[]>([]);
  const [allOrgs, setAllOrgs]         = useState<Org[]>([]);
  const [loading, setLoading]         = useState(true);
  const [panel, setPanel]             = useState<Panel>(action === "create" ? "create" : "list");
  const [selected, setSelected]       = useState<Cluster | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/clusters"),
      api.get("/coes"),           // ✅ correct endpoint
    ]).then(([c, o]) => {
      setClusters(c.data);
      setAllOrgs(o.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Keep selected in sync after reload
  useEffect(() => {
    if (selected) {
      const fresh = clusters.find(c => c.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [clusters]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/clusters/${id}`);
      setDeleteConfirm(null);
      if (selected?.id === id) { setSelected(null); setPanel("list"); }
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Cannot delete cluster");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-sans">Thematic Clusters</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-sans">
            Manage research clusters, assign organisations and leads
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setPanel("create"); }}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2 font-sans">
          <span className="text-lg leading-none">+</span> New Cluster
        </button>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* ── Left: cluster list ── */}
        <div className="w-80 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
            </div>
          ) : clusters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm font-sans">
              <span className="text-3xl mb-2">🗂</span>
              No clusters yet
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {clusters.map((c, i) => {
                const pal      = PALETTE[i % PALETTE.length];
                const isActive = selected?.id === c.id && panel === "detail";
                return (
                  <motion.div
                    key={c.id}
                    whileHover={{ x: 2 }}
                    onClick={() => { setSelected(c); setPanel("detail"); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") { setSelected(c); setPanel("detail"); } }}
                    className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                      isActive
                        ? `${pal.bg} ${pal.border} shadow-sm`
                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${pal.accent}`} />
                        <span className="font-semibold text-gray-900 text-sm font-sans truncate">{c.name}</span>
                      </div>
                      {deleteConfirm === c.id ? (
                        <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleDelete(c.id)}
                            className="text-[10px] px-2 py-1 bg-red-500 text-white rounded-lg font-sans">
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-sans">
                            No
                          </button>
                        </div>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(c.id); }}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0 text-base font-sans">
                          ×
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex gap-3 font-sans text-[11px] text-gray-500">
                      <span>🏢 {c.organizations.length} orgs</span>
                      <span>📦 {c._count.outputs} outputs</span>
                      {c.lead && <span className="truncate">👤 {c.lead.name}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: main panel ── */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {panel === "list" && (
              <motion.div key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <OverviewGrid clusters={clusters} palette={PALETTE}
                  onSelect={(c) => { setSelected(c); setPanel("detail"); }} />
              </motion.div>
            )}
            {panel === "create" && (
              <motion.div key="create"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CreateClusterForm
                  allOrgs={allOrgs}
                  onSuccess={() => { load(); setPanel("list"); }}
                  onCancel={() => setPanel("list")}
                />
              </motion.div>
            )}
            {panel === "detail" && selected && (
              <motion.div key={`detail-${selected.id}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ClusterDetail
                  cluster={selected}
                  allOrgs={allOrgs}
                  palette={PALETTE[clusters.findIndex(c => c.id === selected.id) % PALETTE.length]}
                  onRefresh={load}
                  onBack={() => setPanel("list")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW GRID — shown when nothing selected
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewGrid({ clusters, palette, onSelect }: {
  clusters: Cluster[];
  palette: typeof PALETTE;
  onSelect: (c: Cluster) => void;
}) {
  if (clusters.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-sans">
      <span className="text-5xl mb-4">🗂</span>
      <p>No clusters yet. Create your first one.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {clusters.map((c, i) => {
        const pal = palette[i % palette.length];
        return (
          <motion.div key={c.id}
            whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
            onClick={() => onSelect(c)}
            className={`rounded-2xl border ${pal.border} ${pal.bg} p-5 cursor-pointer hover:shadow-md transition-shadow`}>
            {/* Accent line */}
            <div className={`h-1 w-12 rounded-full ${pal.accent} mb-4`} />
            <h3 className="font-bold text-gray-900 text-base mb-1 font-sans">{c.name}</h3>
            {c.lead && (
              <p className="text-xs text-gray-500 mb-3 font-sans">Lead: {c.lead.name}</p>
            )}
            {/* Org logos strip */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {c.organizations.slice(0, 5).map(({ organization: o }) => (
                <div key={o.id} title={o.name ?? ""}
                  className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                  {o.logo
                    ? <img src={o.logo} className="w-full h-full object-cover" alt="" />
                    : (o.name?.[0] ?? "?")}
                </div>
              ))}
              {c.organizations.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  +{c.organizations.length - 5}
                </div>
              )}
            </div>
            {/* Stats */}
            <div className={`flex gap-4 text-xs font-sans ${pal.text} font-medium`}>
              <span>🏢 {c.organizations.length} orgs</span>
              <span>📦 {c._count.outputs} outputs</span>
              <span>⚡ {c._count.activities} activities</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE CLUSTER FORM
// ═══════════════════════════════════════════════════════════════════════════════
function CreateClusterForm({ allOrgs, onSuccess, onCancel }: {
  allOrgs: Org[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName]       = useState("");
  const [leadId, setLeadId]   = useState("");
  const [orgIds, setOrgIds]   = useState<string[]>([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState("");

  const filteredOrgs = allOrgs.filter(o =>
    (o.name ?? "").toLowerCase().includes(orgSearch.toLowerCase())
  );

  const toggleOrg = (id: string) =>
    setOrgIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Cluster name is required"); return; }
    setBusy(true); setError("");
    try {
      await api.post("/clusters", {
        name: name.trim(),
        ...(leadId ? { leadId } : {}),
        ...(orgIds.length ? { organizationIds: orgIds } : {}),
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create cluster");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel}
          className="text-gray-400 hover:text-gray-700 transition-colors font-sans text-sm flex items-center gap-1">
          ← Back
        </button>
        <h2 className="text-lg font-bold text-gray-900 font-sans">Create New Cluster</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-sans">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide font-sans">
            Cluster Name *
          </label>
          <input
            required value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. HKH Cluster"
            className="input mt-1"
          />
          <p className="text-[11px] text-gray-400 font-sans mt-1">
            Must loosely match the clusterTag values used by researchers (e.g. "HKH Cluster" ↔ HKH_CLUSTER)
          </p>
        </div>

        {/* Lead user ID */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide font-sans">
            Lead User ID <span className="text-gray-400 font-normal normal-case">(optional)</span>
          </label>
          <input
            value={leadId}
            onChange={e => setLeadId(e.target.value)}
            placeholder="User ID of cluster lead"
            className="input mt-1"
          />
        </div>

        {/* Organisations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide font-sans block mb-3">
            Assign Organisations <span className="text-gray-400 font-normal normal-case">({orgIds.length} selected)</span>
          </label>
          <input
            value={orgSearch}
            onChange={e => setOrgSearch(e.target.value)}
            placeholder="Search organisations…"
            className="input mb-3 text-sm"
          />
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {filteredOrgs.map(o => {
              const checked = orgIds.includes(o.id);
              return (
                <label key={o.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    checked ? "bg-gray-900 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}>
                  <input type="checkbox" checked={checked}
                    onChange={() => toggleOrg(o.id)} className="hidden" />
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    checked ? "bg-white text-gray-900" : "bg-white border border-gray-300 text-gray-500"
                  }`}>
                    {o.logo
                      ? <img src={o.logo} className="w-full h-full object-cover rounded-full" alt="" />
                      : (o.name?.[0] ?? "?")}
                  </div>
                  <span className="text-sm font-sans font-medium truncate">{o.name}</span>
                  {checked && <span className="ml-auto text-xs opacity-70 font-sans">✓</span>}
                </label>
              );
            })}
            {filteredOrgs.length === 0 && (
              <p className="text-center text-gray-400 py-4 text-sm font-sans">No organisations found</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy}
            className="px-8 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors font-sans">
            {busy ? "Creating…" : "Create Cluster"}
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors font-sans">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLUSTER DETAIL — view + edit + manage orgs
// ═══════════════════════════════════════════════════════════════════════════════
function ClusterDetail({ cluster, allOrgs, palette: pal, onRefresh, onBack }: {
  cluster: Cluster;
  allOrgs: Org[];
  palette: typeof PALETTE[0];
  onRefresh: () => void;
  onBack: () => void;
}) {
  const [editMode, setEditMode]     = useState(false);
  const [editName, setEditName]     = useState(cluster.name);
  const [editLead, setEditLead]     = useState(cluster.lead?.id ?? "");
  const [editBusy, setEditBusy]     = useState(false);

  const [orgSearch, setOrgSearch]   = useState("");
  const [addOrgIds, setAddOrgIds]   = useState<string[]>([]);
  const [addBusy, setAddBusy]       = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  // Reset on cluster change
  useEffect(() => {
    setEditName(cluster.name);
    setEditLead(cluster.lead?.id ?? "");
    setEditMode(false);
    setAddOrgIds([]);
  }, [cluster.id]);

  const linkedOrgIds = new Set(cluster.organizations.map(o => o.organization.id));

  const unlinkedOrgs = allOrgs.filter(o =>
    !linkedOrgIds.has(o.id) &&
    (o.name ?? "").toLowerCase().includes(orgSearch.toLowerCase())
  );

  const toggleAdd = (id: string) =>
    setAddOrgIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Save name/lead edits
  const saveEdit = async () => {
    setEditBusy(true);
    try {
      await api.patch(`/clusters/${cluster.id}`, {
        ...(editName.trim() !== cluster.name ? { name: editName.trim() } : {}),
        ...(editLead !== (cluster.lead?.id ?? "") ? { leadId: editLead || undefined } : {}),
      });
      setEditMode(false);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Update failed");
    } finally { setEditBusy(false); }
  };

  // Add organisations
  const addOrgs = async () => {
    if (!addOrgIds.length) return;
    setAddBusy(true);
    try {
      await api.post(`/clusters/${cluster.id}/organizations`, { organizationIds: addOrgIds });
      setAddOrgIds([]);
      setOrgSearch("");
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to add organisations");
    } finally { setAddBusy(false); }
  };

  // Remove single organisation
  const removeOrg = async (orgId: string) => {
    try {
      await api.delete(`/clusters/${cluster.id}/organizations`, {
        data: { organizationIds: [orgId] },
      });
      setRemoveConfirm(null);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to remove organisation");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="text-gray-400 hover:text-gray-700 transition-colors font-sans text-sm flex items-center gap-1">
          ← All Clusters
        </button>
      </div>

      {/* ── Cluster header card ── */}
      <div className={`rounded-2xl border ${pal.border} ${pal.bg} p-6`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className={`h-1 w-10 rounded-full ${pal.accent} mb-3`} />
            {editMode ? (
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="input text-xl font-bold bg-white/70 mb-2" />
            ) : (
              <h2 className={`text-2xl font-bold font-sans ${pal.text}`}>{cluster.name}</h2>
            )}
            {editMode ? (
              <input value={editLead} onChange={e => setEditLead(e.target.value)}
                placeholder="Lead user ID (optional)"
                className="input text-sm bg-white/70 mt-2" />
            ) : (
              cluster.lead && (
                <p className="text-sm text-gray-600 font-sans mt-1">
                  👤 Lead: <strong>{cluster.lead.name}</strong>
                  <span className="text-gray-400 ml-1">({cluster.lead.email})</span>
                </p>
              )
            )}
            {cluster.assignedBy && (
              <p className="text-xs text-gray-400 font-sans mt-1">
                Assigned by {cluster.assignedBy.user.name}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 font-sans text-sm shrink-0">
            <div className="text-center">
              <div className={`text-2xl font-bold ${pal.text}`}>{cluster.organizations.length}</div>
              <div className="text-xs text-gray-500">Orgs</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${pal.text}`}>{cluster._count.outputs}</div>
              <div className="text-xs text-gray-500">Outputs</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${pal.text}`}>{cluster.members.length}</div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
          </div>
        </div>

        {/* Edit actions */}
        <div className="flex gap-2 mt-4">
          {editMode ? (
            <>
              <button onClick={saveEdit} disabled={editBusy}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors font-sans">
                {editBusy ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => { setEditMode(false); setEditName(cluster.name); setEditLead(cluster.lead?.id ?? ""); }}
                className="px-4 py-2 bg-white/80 text-gray-600 text-sm rounded-xl hover:bg-white transition-colors font-sans">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)}
              className="px-5 py-2 bg-white/80 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors font-sans border border-white/50">
              ✏️ Edit Name / Lead
            </button>
          )}
        </div>
      </div>

      {/* ── Linked organisations ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 font-sans mb-4 flex items-center gap-2">
          🏢 Linked Organisations
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
            {cluster.organizations.length}
          </span>
        </h3>

        {cluster.organizations.length === 0 ? (
          <p className="text-sm text-gray-400 font-sans py-2">No organisations linked yet.</p>
        ) : (
          <div className="space-y-2">
            {cluster.organizations.map(({ organization: o }) => (
              <div key={o.id}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                    {o.logo
                      ? <img src={o.logo} className="w-full h-full object-cover" alt="" />
                      : (o.name?.[0] ?? "?")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 font-sans">{o.name}</p>
                    {o.type && <p className="text-xs text-gray-400 font-sans">{o.type}</p>}
                  </div>
                </div>

                {removeConfirm === o.id ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => removeOrg(o.id)}
                      className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg font-sans hover:bg-red-600">
                      Remove
                    </button>
                    <button onClick={() => setRemoveConfirm(null)}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-sans">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setRemoveConfirm(o.id)}
                    className="text-xs px-3 py-1.5 border border-red-200 text-red-400 rounded-lg font-sans hover:bg-red-50 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add organisations ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-900 font-sans mb-4 flex items-center gap-2">
          ➕ Add Organisations
          {addOrgIds.length > 0 && (
            <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">
              {addOrgIds.length} selected
            </span>
          )}
        </h3>

        <input value={orgSearch} onChange={e => setOrgSearch(e.target.value)}
          placeholder="Search unlinked organisations…"
          className="input text-sm mb-3" />

        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 mb-4">
          {unlinkedOrgs.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm font-sans">
              {orgSearch ? "No matches" : "All organisations already linked"}
            </p>
          ) : unlinkedOrgs.map(o => {
            const checked = addOrgIds.includes(o.id);
            return (
              <label key={o.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  checked ? "bg-gray-900 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}>
                <input type="checkbox" checked={checked}
                  onChange={() => toggleAdd(o.id)} className="hidden" />
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden ${
                  checked ? "bg-white text-gray-900" : "bg-white border border-gray-200 text-gray-500"
                }`}>
                  {o.logo
                    ? <img src={o.logo} className="w-full h-full object-cover rounded-full" alt="" />
                    : (o.name?.[0] ?? "?")}
                </div>
                <span className="text-sm font-sans font-medium truncate">{o.name}</span>
                {checked && <span className="ml-auto text-xs opacity-70">✓</span>}
              </label>
            );
          })}
        </div>

        <button onClick={addOrgs} disabled={!addOrgIds.length || addBusy}
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-30 transition-colors font-sans">
          {addBusy ? "Adding…" : `Add ${addOrgIds.length || ""} Organisation${addOrgIds.length !== 1 ? "s" : ""}`}
        </button>
      </div>

      {/* ── Members (read-only) ── */}
      {cluster.members.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 font-sans mb-4 flex items-center gap-2">
            👥 Researchers
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
              {cluster.members.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cluster.members.map(m => (
              <div key={m.id}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  {m.researcher.user.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 font-sans truncate">{m.researcher.user.name}</p>
                  <p className="text-xs text-gray-400 font-sans truncate">{m.researcher.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}