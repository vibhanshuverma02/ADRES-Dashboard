"use client";
import { useEffect, useState, useCallback } from "react";
import { Tabs, Tab, Button, Spinner, Card, Badge } from "react-bootstrap";
import { useAuth } from "context/Authcontext";
import api from "helper/api";
import WorkingAreaFilter, { WorkingArea } from "components/common/WorkingAreaFilter";
import { useSearchParams } from "next/navigation";

type Resource = {
  id: string;
  title: string;
  status: string;
  type: string;
  year: string;
  region: string;
  clusterTag: string;
  publishType: string;
  fileUrl: string;
  createdAt: string;
  workingArea: string;
  researcher?: { id: string; name: string; email: string; designation: string };
};

type StatusGroups = { [key: string]: string[] };

const ACTION_LABELS: Record<string, string> = {
  IN_REVIEW: "Send for Review",
  REJECT:    "Reject",
  SEND_BACK: "Send Back",
};

const ACTION_VARIANTS: Record<string, string> = {
  IN_REVIEW: "success",
  REJECT:    "danger",
  SEND_BACK: "warning",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT:                  "secondary",
  IN_REVIEW:              "primary",
  APPROVED:               "success",
  REJECTED:               "danger",
  SEND_BACK:              "warning",
  SENT_BACK_ORG:          "warning",
  PUBLISHED:              "info",
  PUBLISHED_AS_DISCUSSION:"info",
  FAILED:                 "dark",
};

export default function COEManagerReviewPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const areaFromQuery = searchParams.get("area");

  const [activeTab, setActiveTab]         = useState("DRAFT");
  const [resources, setResources]         = useState<Resource[]>([]);  // ← flat list, single source of truth
  const [loading, setLoading]             = useState(true);
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [enums, setEnums]                 = useState<any>(null);
  const [selectedArea, setSelectedArea]   = useState<WorkingArea | null>(null);
  // Per-resource action loading state: { [resourceId]: actionName | null }
  const [actionLoading, setActionLoading] = useState<Record<string, string | null>>({});
  // Per-resource action feedback: { [resourceId]: 'success' | 'error' }
  const [actionFeedback, setActionFeedback] = useState<Record<string, "success" | "error">>({});

  const statusGroups: StatusGroups = {
    DRAFT:     ["DRAFT"],
    IN_REVIEW: ["IN_REVIEW"],
    REJECTED:  ["REJECTED"],
    APPROVED:  ["APPROVED"],
    SENT_BACK: ["SEND_BACK", "SENT_BACK_ORG"],
    PUBLISHED: ["PUBLISHED", "PUBLISHED_AS_DISCUSSION"],
    FAILED:    ["FAILED"],
  };

  // ── Fetch enums once ──────────────────────────────────────────────────────
  const fetchEnums = useCallback(async () => {
    try {
      const res = await api.get(`/users/resource-options`);
      setEnums(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch enums", err);
    }
  }, []);

  // ── Fetch & flatten reviewQueue ───────────────────────────────────────────
  const fetchData = useCallback(
    async (uid: string, retryCount = 0) => {
      if (!uid) return;
      if (retryCount === 0) setLoading(true);
      try {
        const params: any = { include: "reviewQueue" };
        if (user?.roles?.length > 1) params.role = "COE_MANAGER";
        const res = await api.get(`/users/profile`, { params });

        // Flatten reviewQueue → flat Resource[]
        const flat: Resource[] = (res.data?.reviewQueue ?? []).flatMap((rq: any) =>
          (rq.resources || []).map((r: Resource) => ({ ...r, researcher: rq.researcher }))
        );
        setResources(flat);

        if (res.data?.rebuilding && retryCount < 10) {
          setIsRefreshing(true);
          setTimeout(() => fetchData(uid, retryCount + 1), 3000);
        } else {
          setIsRefreshing(false);
        }
      } catch (err) {
        console.error("❌ Failed to fetch COE data", err);
        setIsRefreshing(false);
      } finally {
        if (retryCount === 0) setLoading(false);
      }
    },
    [user?.roles]
  );

  useEffect(() => {
    if (user) {
      const uid = user.id || user.sub;
      fetchEnums();
      fetchData(uid);
    }
  }, [user, fetchData, fetchEnums]);

  useEffect(() => {
    if (areaFromQuery) {
      const decoded = decodeURIComponent(areaFromQuery).replace(/\+/g, " ");
      setSelectedArea({ id: "", name: decoded });
    }
  }, [areaFromQuery]);

  // ── Action handler with optimistic update ────────────────────────────────
  const handleAction = async (resourceId: string, action: string) => {
    // Prevent double-click
    if (actionLoading[resourceId]) return;

    // 1️⃣ Mark button as loading
    setActionLoading(prev => ({ ...prev, [resourceId]: action }));
    setActionFeedback(prev => { const n = { ...prev }; delete n[resourceId]; return n; });

    // 2️⃣ Optimistic UI — move resource to new status immediately
    const optimisticStatus =
      action === "IN_REVIEW" ? "IN_REVIEW" :
      action === "REJECT"    ? "REJECTED"  :
      action === "SEND_BACK" ? "SEND_BACK" : action;

    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, status: optimisticStatus } : r)
    );

    try {
      // 3️⃣ Fire the API
      await api.post(`/coes/single`, { resourceId, action });

      // 4️⃣ Show success briefly
      setActionFeedback(prev => ({ ...prev, [resourceId]: "success" }));

      // 5️⃣ Refetch in background to sync real server state
      const uid = user.id || user.sub;
      fetchData(uid);
    } catch (err: any) {
      console.error("❌ Action failed:", err);

      // 6️⃣ Revert optimistic update on error
      setResources(prev =>
        prev.map(r => r.id === resourceId ? { ...r, status: "DRAFT" } : r)
      );
      setActionFeedback(prev => ({ ...prev, [resourceId]: "error" }));
    } finally {
      setActionLoading(prev => ({ ...prev, [resourceId]: null }));
      // Clear feedback after 3s
      setTimeout(() => {
        setActionFeedback(prev => { const n = { ...prev }; delete n[resourceId]; return n; });
      }, 3000);
    }
  };

  // ── Filter & group ────────────────────────────────────────────────────────
  const filtered = selectedArea
    ? resources.filter(r => r.workingArea === selectedArea.name)
    : resources;

  const grouped = filtered.reduce<Record<string, Resource[]>>((acc, r) => {
    const s = r.status || "UNKNOWN";
    if (!acc[s]) acc[s] = [];
    acc[s].push(r);
    return acc;
  }, {});

  // ── Count badge per tab ───────────────────────────────────────────────────
  const tabCount = (statusKey: string) =>
    statusGroups[statusKey].reduce((n, s) => n + (grouped[s]?.length ?? 0), 0);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="fw-semibold mb-0">Resource Review Dashboard</h4>
        {isRefreshing && (
          <span className="text-muted small d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Syncing...
          </span>
        )}
      </div>

      <div className="mb-4" style={{ maxWidth: 300 }}>
        <WorkingAreaFilter
          onSelect={setSelectedArea}
          defaultLabel="All Working Areas"
          defaultValue={areaFromQuery || ""}
        />
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "DRAFT")} className="mb-3">
        {Object.keys(statusGroups).map((statusKey) => {
          const count = tabCount(statusKey);
          const resourcesForTab: Resource[] = statusGroups[statusKey].flatMap(
            (s) => grouped[s] ?? []
          );

          return (
            <Tab
              key={statusKey}
              eventKey={statusKey}
              title={
                <span>
                  {statusKey.replaceAll("_", " ")}
                  {count > 0 && (
                    <Badge bg="secondary" className="ms-1" style={{ fontSize: "0.7rem" }}>
                      {count}
                    </Badge>
                  )}
                </span>
              }
            >
              <div className="mt-3">
                {resourcesForTab.length === 0 ? (
                  <p className="text-muted">
                    No resources{selectedArea ? ` in "${selectedArea.name}"` : ""}.
                  </p>
                ) : (
                  resourcesForTab.map((res) => {
                    const isActing  = !!actionLoading[res.id];
                    const feedback  = actionFeedback[res.id];

                    return (
                      <Card key={res.id} className={`mb-3 shadow-sm ${feedback === "error" ? "border-danger" : feedback === "success" ? "border-success" : ""}`}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start gap-3">
                            {/* Left — info */}
                            <div className="flex-grow-1 min-w-0">
                              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <h6 className="fw-semibold mb-0">{res.title}</h6>
                                <Badge bg={STATUS_BADGE[res.status] ?? "secondary"} style={{ fontSize: "0.7rem" }}>
                                  {res.status.replaceAll("_", " ")}
                                </Badge>
                              </div>

                              <p className="mb-1 text-muted small">
                                <strong>Researcher:</strong> {res.researcher?.name ?? "—"}
                                {res.researcher?.designation ? ` · ${res.researcher.designation}` : ""}
                              </p>

                              <p className="mb-1 small">
                                <strong>Type:</strong> {res.type || "—"} &nbsp;|&nbsp;
                                <strong>Year:</strong> {res.year || "—"} &nbsp;|&nbsp;
                                <strong>Region:</strong> {res.region || "—"} &nbsp;|&nbsp;
                                <strong>Area:</strong> {res.workingArea || "N/A"}
                              </p>

                              {res.fileUrl ? (
                                <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="small">
                                  📄 View File
                                </a>
                              ) : (
                                <span className="text-muted small">No file attached</span>
                              )}

                              {/* Feedback messages */}
                              {feedback === "success" && (
                                <p className="text-success small mt-1 mb-0">✅ Action applied successfully</p>
                              )}
                              {feedback === "error" && (
                                <p className="text-danger small mt-1 mb-0">❌ Action failed — please try again</p>
                              )}
                            </div>

                            {/* Right — action buttons (only on DRAFT tab) */}
                            {statusKey === "DRAFT" && enums?.Action && (
                              <div className="d-flex flex-column gap-2 shrink-0">
                                {enums.Action.filter((a: string) =>
                                  ["IN_REVIEW", "REJECT", "SEND_BACK"].includes(a)
                                ).map((act: string) => (
                                  <Button
                                    key={act}
                                    size="sm"
                                    variant={ACTION_VARIANTS[act] ?? "secondary"}
                                    disabled={isActing}
                                    onClick={() => handleAction(res.id, act)}
                                    style={{ minWidth: 120 }}
                                  >
                                    {isActing && actionLoading[res.id] === act ? (
                                      <><Spinner animation="border" size="sm" className="me-1" />{ACTION_LABELS[act]}</>
                                    ) : (
                                      ACTION_LABELS[act] ?? act.replaceAll("_", " ")
                                    )}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })
                )}
              </div>
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
}