"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Nav, Tabs, Tab, Spinner, Badge, Button, Modal } from "react-bootstrap";
import UploadResourceForm from "components/dashboard/researchers_dashboard/uploadResource";
import { useAuth } from "context/Authcontext";
import api from "helper/api";
import WorkingAreaFilter, { WorkingArea } from "components/common/WorkingAreaFilter";

interface Resource {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  fileUrl?: string;
  createdAt: string;
  workingArea?: { id?: string; name: string } | null;
  uploadedById: string;
}

interface ResourceOptions {
  resourcestatus: string[];
}

// Statuses the researcher is allowed to delete
const DELETABLE_STATUSES = ['DRAFT', 'FAILED', 'REJECTED', 'SEND_BACK', 'SENT_BACK_ORG'];
// ── ResourceSection ────────────────────────────────────────────────────────────
function ResourceSection({
  title,
  data,
  onDelete,
  deletingId,
}: {
  title: string;
  data: Resource[];
  onDelete?: (res: Resource) => void;
  deletingId?: string | null;
}) {
  return (
    <div className="mt-3">
      <h5 className="text-lg font-semibold mb-3">{title}</h5>
      {data.length === 0 ? (
        <p className="text-gray-500">No resources found.</p>
      ) : (
        <div className="grid gap-3">
          {data.map((item) => {
            const canDelete = DELETABLE_STATUSES.includes(item.status);
            const isDeleting = deletingId === item.id;
            return (
              <div
                key={item.id}
                className="border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition"
                style={{ opacity: isDeleting ? 0.5 : 1 }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="font-semibold mb-1">{item.title}</h6>
                    <p className="text-sm text-gray-600 mb-1">
                      {item.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      <Badge
                        bg={
                          item.status === "PUBLISHED" ? "success" :
                          item.status === "REJECTED" || item.status === "FAILED" ? "danger" :
                          item.status === "IN_REVIEW" ? "primary" :
                          item.status === "APPROVED" ? "success" :
                          item.status?.includes("SENT_BACK") || item.status === "SEND_BACK" ? "warning" :
                          "secondary"
                        }
                        className="me-2"
                      >
                        {item.status?.replaceAll("_", " ")}
                      </Badge>
                      Uploaded: {new Date(item.createdAt).toLocaleDateString()} &nbsp;|&nbsp;
                      Area: {item.workingArea?.name || "N/A"}
                    </p>
                    {/* File not ready yet indicator */}
                    {item.status === "DRAFT" && !item.fileUrl && (
                      <p className="text-xs text-orange-500 d-flex align-items-center gap-1">
                        <Spinner animation="border" size="sm" style={{ width: 10, height: 10 }} />
                        &nbsp;File upload in progress…
                      </p>
                    )}
                    {item.fileUrl && (
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600">
                        📄 View File
                      </a>
                    )}
                  </div>

                  {/* Delete button — only for DRAFT / FAILED */}
                  {canDelete && onDelete && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-3 shrink-0"
                      disabled={isDeleting}
                      onClick={() => onDelete(item)}
                    >
                      {isDeleting ? (
                        <><Spinner animation="border" size="sm" className="me-1" />Deleting…</>
                      ) : (
                        "🗑 Delete"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main UploadsPage ───────────────────────────────────────────────────────────
export default function UploadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, activeRole } = useAuth();

  const section = searchParams.get("section") || "mydrafts";

  const [resources, setResources]           = useState<Resource[]>([]);
  const [resourceOptions, setResourceOptions] = useState<ResourceOptions | null>(null);
  const [loading, setLoading]               = useState(false);
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [selectedArea, setSelectedArea]     = useState<WorkingArea | null>(null);

  // Delete state
  const [confirmRes, setConfirmRes]         = useState<Resource | null>(null); // resource pending confirm
  const [deletingId, setDeletingId]         = useState<string | null>(null);
  const [deleteError, setDeleteError]       = useState<string | null>(null);

  // ── Fetch enums ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/users/resource-options")
      .then(res => setResourceOptions(res.data))
      .catch(err => console.error("Error fetching resource options:", err));
  }, []);

  // ── Fetch profile & uploads (with cache-rebuild retry) ───────────────────
  const fetchData = useCallback(async (uid: string, retryCount = 0) => {
    if (!uid) return;
    if (retryCount === 0) setLoading(true);
    try {
      const params: any = { include: "uploads" };
      if (user?.roles?.length > 1) params.role = "RESEARCHER";
      const res = await api.get(`/users/profile`, { params });

      if (res.data?.rebuilding) {
        setIsRefreshing(true);
        if (retryCount < 10) setTimeout(() => fetchData(uid, retryCount + 1), 3000);
        else setIsRefreshing(false);
        return;
      }

      setResources(res.data?.uploads?.resources || []);
      setIsRefreshing(false);
    } catch (err) {
      console.error("❌ Failed to fetch data", err);
      setIsRefreshing(false);
    } finally {
      if (retryCount === 0) setLoading(false);
    }
  }, [user?.roles]);

  useEffect(() => {
    if (user?.sub) fetchData(user.sub);
  }, [user?.sub, fetchData]);

  // ── Tab navigation ───────────────────────────────────────────────────────
  const handleSelectSection = useCallback((key: string | null) => {
    if (!key) return;
    router.push(`/researcher/Dashboard/Myuploads?section=${key}`);
  }, [router]);

  // ── Delete flow ──────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!confirmRes) return;
    const id = confirmRes.id;
    setConfirmRes(null);
    setDeletingId(id);
    setDeleteError(null);

    // Optimistic — remove from local state immediately
    setResources(prev => prev.filter(r => r.id !== id));

    try {
      await api.delete(`/users/delete-resource/${id}`);
      // Background sync to confirm server state
      fetchData(user.sub);
    } catch (err: any) {
      // Revert: re-fetch to restore
      console.error("❌ Delete failed:", err);
      setDeleteError(err?.response?.data?.message || "Delete failed. Please try again.");
      fetchData(user.sub);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const byArea = selectedArea
    ? resources.filter(r => r.workingArea?.name === selectedArea.name)
    : resources;

  const getByStatus = (...statuses: string[]) =>
    byArea.filter(r => statuses.includes(r.status));

  const myDrafts       = byArea;
  const pending        = getByStatus("DRAFT");
  const inReview       = getByStatus("IN_REVIEW");
  const approved       = getByStatus("APPROVED");
  const published      = getByStatus("PUBLISHED");
  const discussion     = getByStatus("PUBLISHED_AS_DISCUSSION");
  const rejectedByCoe  = getByStatus("REJECTED");
  const finalRejected  = getByStatus("FAILED");
  const sentBackByCoe  = getByStatus("SENT_BACK");
  const sentBackByOrg  = getByStatus("SEND_BACK_ORG", "SENT_BACK_ORG");

  // Count badge helper
  const count = (...statuses: string[]) => getByStatus(...statuses).length;

  // ── Tab title with badge ──────────────────────────────────────────────────
  const tabTitle = (label: string, n: number) => (
    <span>
      {label}
      {n > 0 && <Badge bg="secondary" className="ms-1" style={{ fontSize: "0.65rem" }}>{n}</Badge>}
    </span>
  );

  if (loading || !resourceOptions) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">📚 My Uploads</h2>
        {isRefreshing && (
          <span className="text-muted small d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Syncing…
          </span>
        )}
      </div>

      {deleteError && (
        <div className="alert alert-danger py-2 small d-flex justify-content-between align-items-center">
          ❌ {deleteError}
          <button className="btn-close btn-sm" onClick={() => setDeleteError(null)} />
        </div>
      )}

      {/* Working Area Filter */}
      <div className="mb-4" style={{ maxWidth: 300 }}>
        <WorkingAreaFilter onSelect={setSelectedArea} defaultLabel="All Working Areas" />
      </div>

      {/* Tabs */}
      <Nav variant="tabs" activeKey={section} onSelect={handleSelectSection} className="mb-4">
        <Nav.Item><Nav.Link eventKey="mydrafts">{tabTitle("My Drafts", byArea.length)}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="pending">{tabTitle("Pending", count("DRAFT"))}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="underreview">{tabTitle("Under Review", count("IN_REVIEW"))}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="approved">{tabTitle("Approved", count("APPROVED"))}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="published">{tabTitle("Published", count("PUBLISHED", "PUBLISHED_AS_DISCUSSION"))}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="rejected">{tabTitle("Rejected", count("REJECTED", "FAILED"))}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="sentback">{tabTitle("Sent Back", count("SENT_BACK", "SEND_BACK_ORG", "SENT_BACK_ORG"))}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="new">➕ Upload New</Nav.Link></Nav.Item>
      </Nav>

      {/* Section Rendering */}
      {section === "new" && <UploadResourceForm />}

      {section === "mydrafts" && (
        <ResourceSection title="My Drafts" data={myDrafts}
          onDelete={setConfirmRes} deletingId={deletingId} />
      )}
      {section === "pending" && (
        <ResourceSection title="Pending Resources" data={pending}
          onDelete={setConfirmRes} deletingId={deletingId} />
      )}
      {section === "underreview" && (
        <ResourceSection title="Under Review" data={inReview} />
      )}
      {section === "approved" && (
        <ResourceSection title="Approved Resources" data={approved} />
      )}
      {section === "published" && (
        <Tabs defaultActiveKey="publishedResources" className="mb-3">
          <Tab eventKey="publishedResources" title="Published">
            <ResourceSection title="Published Resources" data={published} />
          </Tab>
          <Tab eventKey="discussion" title="Discussion Forum">
            <ResourceSection title="Published as Discussion" data={discussion} />
          </Tab>
        </Tabs>
      )}
      {section === "rejected" && (
        <Tabs defaultActiveKey="rejectedByCoe" className="mb-3">
          <Tab eventKey="rejectedByCoe" title="Rejected by CoE">
            <ResourceSection title="Rejected by CoE" data={rejectedByCoe}
              onDelete={setConfirmRes} deletingId={deletingId} />
          </Tab>
          <Tab eventKey="finalRejected" title="Final Rejected">
            <ResourceSection title="Final Rejected" data={finalRejected}
              onDelete={setConfirmRes} deletingId={deletingId} />
          </Tab>
        </Tabs>
      )}
      {section === "sentback" && (
        <Tabs defaultActiveKey="sentBackByCoe" className="mb-3">
          <Tab eventKey="sentBackByCoe" title="Sent Back by CoE">
            <ResourceSection title="Sent Back by CoE" data={sentBackByCoe}
              onDelete={setConfirmRes} deletingId={deletingId} />
          </Tab>
          <Tab eventKey="sentBackByAdmin" title="Sent Back by Admin">
            <ResourceSection title="Sent Back by Admin" data={sentBackByOrg}
              onDelete={setConfirmRes} deletingId={deletingId} />
          </Tab>
        </Tabs>
      )}

      {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
      <Modal show={!!confirmRes} onHide={() => setConfirmRes(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Resource</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete:</p>
          <p className="fw-semibold">"{confirmRes?.title}"</p>
          <p className="text-muted small">
            This will permanently remove the file from storage and cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmRes(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function UploadPreview({ id }: { id: string }) {
  return (
    <div className="p-4">
      <h4>👀 Preview & Edit Upload</h4>
      <p>ID: {id}</p>
    </div>
  );
}