"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Tabs, Tab, Card, Button, Modal, Form, Spinner, Badge,
} from "react-bootstrap";
import { useAuth } from "context/Authcontext";
import api from "helper/api";

interface Cluster { id: string; name: string; }

const ACTION_VARIANTS: Record<string, string> = {
  APPROVE: "success", REJECT: "danger", SEND_BACK: "warning", SENT_BACK_ORG: "warning",
};
const ACTION_LABELS: Record<string, string> = {
  APPROVE: "Approve", REJECT: "Reject", SEND_BACK: "Send Back", SENT_BACK_ORG: "Send Back to Org",
};
const OPTIMISTIC_STATUS: Record<string, string> = {
  APPROVE: "APPROVED", REJECT: "REJECTED", SEND_BACK: "SEND_BACK", SENT_BACK_ORG: "SENT_BACK_ORG",
};
const STATUS_BADGE: Record<string, string> = {
  IN_REVIEW: "primary", APPROVED: "success", REJECTED: "danger",
  SEND_BACK: "warning", SENT_BACK_ORG: "warning", PUBLISHED: "info",
};

export default function SuperAdminResources() {
  const { user } = useAuth();

  const [activeTab, setActiveTab]       = useState<"IN_REVIEW" | "APPROVED" | "SENT_BACK" | "PUBLISHED">("IN_REVIEW");
  const [groupedData, setGroupedData]   = useState<any[]>([]);
  const [enums, setEnums]               = useState<any>(null);
  const [clusters, setClusters]         = useState<Cluster[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [actionLoading, setActionLoading]   = useState<Record<string, string | null>>({});
  const [actionFeedback, setActionFeedback] = useState<Record<string, "success" | "error">>({});

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishMode, setPublishMode]           = useState<"PUBLISH" | "ADD_DISCUSSION">("PUBLISH");
  const [publishForm, setPublishForm]           = useState({ title: "", summary: "", fileUrl: "", clusterId: "" });
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [publishLoading, setPublishLoading]     = useState(false);
  const [publishError, setPublishError]         = useState<string | null>(null);

  const statusGroups: Record<"IN_REVIEW" | "APPROVED" | "SENT_BACK" | "PUBLISHED", string[]> = {
    IN_REVIEW: ["IN_REVIEW"],
    APPROVED:  ["APPROVED"],
    SENT_BACK: ["SEND_BACK", "SENT_BACK_ORG"],
    PUBLISHED: ["PUBLISHED"],
  };

  const fetchClusters = useCallback(async () => {
    try { setClusters((await api.get("/clusters/public")).data); }
    catch (err) { console.error("❌ Cluster fetch failed:", err); }
  }, []);

  const fetchEnums = useCallback(async () => {
    try { setEnums((await api.get("/users/resource-options")).data); }
    catch (err) { console.error("❌ Enum fetch failed:", err); }
  }, []);

  const fetchData = useCallback(async (uid: string, retryCount = 0) => {
    if (!uid) return;
    if (retryCount === 0) setLoading(true);
    try {
      const res = await api.get("/users/profile/", { params: { include: "uploads" } });
      if (res.data?.rebuilding && retryCount < 10) {
        setIsRefreshing(true);
        setTimeout(() => fetchData(uid, retryCount + 1), 3000);
        return;
      }
      setGroupedData(res.data?.uploads?.grouped || []);
      setIsRefreshing(false);
    } catch (err) {
      console.error("❌ Failed to fetch data", err);
      setIsRefreshing(false);
    } finally {
      if (retryCount === 0) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const uid = user.id || user.sub;
      fetchEnums(); fetchClusters(); fetchData(uid);
    }
  }, [user, fetchEnums, fetchClusters, fetchData]);

  // ── Optimistic review action ───────────────────────────────────────────
  const handleReviewAction = async (resourceId: string, action: string) => {
    if (actionLoading[resourceId]) return;
    setActionLoading(prev => ({ ...prev, [resourceId]: action }));
    setActionFeedback(prev => { const n = { ...prev }; delete n[resourceId]; return n; });

    const optimistic = OPTIMISTIC_STATUS[action] ?? action;
    setGroupedData(prev => prev.map(g => ({
      ...g,
      resources: g.resources.map((r: any) => r.id === resourceId ? { ...r, status: optimistic } : r),
    })));

    try {
      await api.post(`/admin/review_resource/${resourceId}`, {
        remark: `${action} by ${user.username}`, action,
      });
      setActionFeedback(prev => ({ ...prev, [resourceId]: "success" }));
      fetchData(user.id || user.sub);
    } catch (err) {
      console.error(err);
      setGroupedData(prev => prev.map(g => ({
        ...g,
        resources: g.resources.map((r: any) => r.id === resourceId ? { ...r, status: "IN_REVIEW" } : r),
      })));
      setActionFeedback(prev => ({ ...prev, [resourceId]: "error" }));
    } finally {
      setActionLoading(prev => ({ ...prev, [resourceId]: null }));
      setTimeout(() => setActionFeedback(prev => { const n = { ...prev }; delete n[resourceId]; return n; }), 3000);
    }
  };

  // ── Publish modal ──────────────────────────────────────────────────────
  const openPublishModal = (res: any, mode: "PUBLISH" | "ADD_DISCUSSION") => {
    setSelectedResource(res); setPublishMode(mode); setPublishError(null);
    const norm = (s: string) => s.toLowerCase().trim().replace(/[\s-]+/g, "_");
    const matched = clusters.find(c => norm(c.name) === norm(res.clusterTag || ""));
    setPublishForm({ title: res.title, summary: "", fileUrl: res.fileUrl || "", clusterId: matched?.id ?? "" });
    setShowPublishModal(true);
  };

  const closePublishModal = () => {
    setShowPublishModal(false); setPublishError(null); setSelectedResource(null);
    setPublishMode("PUBLISH"); setPublishForm({ title: "", summary: "", fileUrl: "", clusterId: "" });
  };

  const handlePublish = async () => {
    if (publishLoading) return;
    setPublishLoading(true); setPublishError(null);
    const rid = selectedResource?.id;

    // Optimistic
    setGroupedData(prev => prev.map(g => ({
      ...g,
      resources: g.resources.map((r: any) => r.id === rid ? { ...r, status: "PUBLISHED" } : r),
    })));

    try {
      await api.post(`/admin/publish/${rid}`, {
        publishAsDiscussionForm: publishMode === "ADD_DISCUSSION",
        metadata: {
          title: publishForm.title, summary: publishForm.summary,
          fileUrl: publishForm.fileUrl || selectedResource?.fileUrl,
          ...(publishForm.clusterId ? { clusterId: publishForm.clusterId } : {}),
        },
      });
      closePublishModal();
      fetchData(user.id || user.sub);
    } catch (err: any) {
      // Revert
      setGroupedData(prev => prev.map(g => ({
        ...g,
        resources: g.resources.map((r: any) => r.id === rid ? { ...r, status: "APPROVED" } : r),
      })));
      setPublishError(err?.response?.data?.message || "Publish failed. Please try again.");
    } finally {
      setPublishLoading(false);
    }
  };

  const tabCount = (statusKey: keyof typeof statusGroups) =>
    groupedData.reduce((t, g) =>
      t + g.resources.filter((r: any) => statusGroups[statusKey].includes(r.status)).length, 0);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
      <Spinner animation="border" /><span className="text-muted">Loading resources…</span>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="fw-bold text-primary mb-0">SuperAdmin Resource Dashboard</h3>
        {isRefreshing && (
          <span className="text-muted small d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Syncing…
          </span>
        )}
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)} className="mb-4">
        {(Object.keys(statusGroups) as Array<keyof typeof statusGroups>).map((statusKey) => (
          <Tab key={statusKey} eventKey={statusKey} title={
            <span>
              {statusKey.replaceAll("_", " ")}
              {tabCount(statusKey) > 0 && (
                <Badge bg="secondary" className="ms-1" style={{ fontSize: "0.7rem" }}>{tabCount(statusKey)}</Badge>
              )}
            </span>
          }>
            <div className="mt-3">
              {groupedData.map((group: any) => {
                const filtered = group.resources.filter((r: any) => statusGroups[statusKey].includes(r.status));
                if (!filtered.length) return null;

                // PUBLISHED tab
                if (statusKey === "PUBLISHED") {
                  const byType: Record<string, any[]> = {};
                  filtered.forEach((r: any) => { (byType[r.type || "OTHER"] ??= []).push(r); });
                  return (
                    <div key={group.organization.id} className="mb-5">
                      <h5 className="fw-semibold mb-3 text-info border-bottom pb-2">{group.organization.name}</h5>
                      {(enums?.ResourceType || Object.keys(byType)).map((type: string) =>
                        byType[type]?.length ? (
                          <div key={type} className="mb-4">
                            <h6 className="fw-semibold text-primary mb-3">{type.replaceAll("_", " ")}</h6>
                            <div className="row">
                              {byType[type].map((res: any) => (
                                <div className="col-md-6 mb-3" key={res.id}>
                                  <Card className="shadow-sm border-0 h-100">
                                    <Card.Body className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="fw-semibold">{res.title}</h6>
                                        {res.output?.cluster?.name
                                          ? <Badge bg="primary" className="mb-2 me-1">🗂 {res.output.cluster.name}</Badge>
                                          : <Badge bg="secondary" className="mb-2 me-1 opacity-50">No Cluster</Badge>}
                                        {res.output?.forum && <Badge bg="success" className="mb-2">💬 Discussion Active</Badge>}
                                        <p className="mb-1 mt-1 small"><strong>By:</strong> {res.uploadedBy?.user?.name || "Unknown"}</p>
                                        <p className="mb-1 small"><strong>Region:</strong> {res.region} | <strong>Year:</strong> {res.year}</p>
                                        {res.fileUrl ? <a href={res.fileUrl} target="_blank" rel="noreferrer" className="text-info small">📄 View File</a>
                                          : <span className="text-muted small">No file</span>}
                                      </div>
                                      <div className="d-flex flex-column gap-2">
                                        {!res.output?.forum
                                          ? <Button variant="secondary" size="sm" onClick={() => openPublishModal(res, "ADD_DISCUSSION")}>+ Discussion</Button>
                                          : <Button variant="outline-success" size="sm" href={`/forums/${res.output.forum.id}`}>View Discussion</Button>}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  );
                }

                // Other tabs
                return (
                  <div key={group.organization.id} className="mb-5">
                    <h5 className="fw-semibold mb-3"><Badge bg="info">{group.organization.name}</Badge></h5>
                    {filtered.map((res: any) => {
                      const isActing = !!actionLoading[res.id];
                      const feedback = actionFeedback[res.id];
                      return (
                        <Card key={res.id} className={`mb-3 shadow-sm border-0 ${feedback === "error" ? "border border-danger" : feedback === "success" ? "border border-success" : ""}`}>
                          <Card.Body className="d-flex justify-content-between align-items-start gap-3">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <h6 className="fw-semibold mb-0">{res.title}</h6>
                                <Badge bg={STATUS_BADGE[res.status] ?? "secondary"} style={{ fontSize: "0.7rem" }}>
                                  {res.status?.replaceAll("_", " ")}
                                </Badge>
                              </div>
                              <p className="mb-1 small text-muted"><strong>By:</strong> {res.uploadedBy?.user?.name || "Unknown"}</p>
                              <p className="mb-1 small">
                                <strong>Type:</strong> {res.type} &nbsp;|&nbsp;
                                <strong>Tag:</strong> <span className="text-muted">{res.clusterTag || "—"}</span> &nbsp;|&nbsp;
                                <strong>Year:</strong> {res.year}
                              </p>
                              {res.fileUrl ? <a href={res.fileUrl} target="_blank" rel="noreferrer" className="small">📄 View File</a>
                                : <span className="text-muted small">No file</span>}
                              {feedback === "success" && <p className="text-success small mt-1 mb-0">✅ Done</p>}
                              {feedback === "error"   && <p className="text-danger small mt-1 mb-0">❌ Failed — try again</p>}
                            </div>

                            {statusKey === "IN_REVIEW" && (
                              <div className="d-flex flex-column gap-2 shrink-0">
                                {(["APPROVE", "REJECT", "SEND_BACK", "SENT_BACK_ORG"] as const).map((act) => (
                                  <Button key={act} size="sm" variant={ACTION_VARIANTS[act]}
                                    disabled={isActing} style={{ minWidth: 130 }}
                                    onClick={() => handleReviewAction(res.id, act)}>
                                    {isActing && actionLoading[res.id] === act
                                      ? <><Spinner animation="border" size="sm" className="me-1" />{ACTION_LABELS[act]}</>
                                      : ACTION_LABELS[act]}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {statusKey === "APPROVED" && (
                              <Button variant="success" size="sm" style={{ minWidth: 100 }}
                                onClick={() => openPublishModal(res, "PUBLISH")}>
                                Publish
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                );
              })}

              {groupedData.every((g: any) => !g.resources.some((r: any) => statusGroups[statusKey].includes(r.status))) && (
                <p className="text-muted mt-2">No resources in this stage.</p>
              )}
            </div>
          </Tab>
        ))}
      </Tabs>

      {/* Publish Modal */}
      <Modal show={showPublishModal} onHide={closePublishModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{publishMode === "ADD_DISCUSSION" ? "Add Discussion Forum" : "Publish Resource"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {publishError && <div className="alert alert-danger py-2 small">{publishError}</div>}
          {publishMode === "ADD_DISCUSSION" ? (
            <div>
              <p>Adding a discussion forum to <strong>{selectedResource?.title}</strong>.</p>
              <p className="text-muted small">The resource stays published. A thread will be created and linked.</p>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Output Title</Form.Label>
                <Form.Control value={publishForm.title}
                  onChange={e => setPublishForm({ ...publishForm, title: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Summary</Form.Label>
                <Form.Control as="textarea" rows={3} value={publishForm.summary}
                  onChange={e => setPublishForm({ ...publishForm, summary: e.target.value })}
                  placeholder="Optional" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>File URL (optional override)</Form.Label>
                <Form.Control value={publishForm.fileUrl}
                  onChange={e => setPublishForm({ ...publishForm, fileUrl: e.target.value })}
                  placeholder={selectedResource?.fileUrl || "Use resource file"} />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label className="fw-semibold">Thematic Cluster</Form.Label>
                {selectedResource?.clusterTag && (
                  <div className="mb-2">
                    <Badge bg="light" text="dark" className="border">Tag: <strong>{selectedResource.clusterTag}</strong></Badge>
                    {publishForm.clusterId
                      ? <Badge bg="success" className="ms-2">✓ Auto-matched</Badge>
                      : <Badge bg="warning" text="dark" className="ms-2">Select manually</Badge>}
                  </div>
                )}
                <Form.Select value={publishForm.clusterId}
                  onChange={e => setPublishForm({ ...publishForm, clusterId: e.target.value })}>
                  <option value="">— No cluster / assign later —</option>
                  {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePublishModal} disabled={publishLoading}>Cancel</Button>
          <Button variant={publishMode === "ADD_DISCUSSION" ? "success" : "primary"}
            onClick={handlePublish} disabled={publishLoading}>
            {publishLoading
              ? <><Spinner animation="border" size="sm" className="me-1" />Processing…</>
              : publishMode === "ADD_DISCUSSION" ? "Confirm — Add Discussion" : "Publish"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}