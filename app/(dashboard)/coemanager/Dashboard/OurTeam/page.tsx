"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Nav, Card, Badge, Button, Spinner, Modal } from "react-bootstrap";
import OnboardResearcherPage from "components/dashboard/coe-dashboard/onboarding form";
import api from "helper/api";

interface Researcher {
  id: string;
  user: {
    name: string;
    email: string;
    designation: string;
    image: string | null;
    contacts: any;
  };
}

// ── Active Researchers List ───────────────────────────────────────────────────
function ActiveResearchers() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading]         = useState(true);
  const [confirmRes, setConfirmRes]   = useState<Researcher | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const fetchResearchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/coes/researchers");
      setResearchers(res.data);
    } catch (err) {
      console.error("Failed to fetch researchers", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResearchers(); }, [fetchResearchers]);

  const handleDeactivateConfirm = async () => {
    if (!confirmRes) return;
    const id = confirmRes.id;
    setConfirmRes(null);
    setDeactivating(id);
    setError(null);

    // Optimistic
    setResearchers(prev => prev.filter(r => r.id !== id));

    try {
      await api.patch(`/coes/researchers/${id}/deactivate`);
      fetchResearchers(); // background sync
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to deactivate. Please try again.");
      fetchResearchers(); // revert
    } finally {
      setDeactivating(null);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
      <Spinner animation="border" size="sm" /> Loading researchers…
    </div>
  );

  return (
    <div className="mt-3">
      {error && (
        <div className="alert alert-danger py-2 small d-flex justify-content-between">
          ❌ {error}
          <button className="btn-close btn-sm" onClick={() => setError(null)} />
        </div>
      )}

      {researchers.length === 0 ? (
        <p className="text-muted">No active researchers found.</p>
      ) : (
        <div className="row g-3">
          {researchers.map((r) => (
            <div className="col-md-6 col-lg-4" key={r.id}>
              <Card className="shadow-sm border-0 h-100"
                style={{ opacity: deactivating === r.id ? 0.5 : 1 }}>
                <Card.Body className="d-flex align-items-start gap-3">
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                    background: "#e9ecef", overflow: "hidden", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {r.user.image
                      ? <img src={r.user.image} alt={r.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : "👤"}
                  </div>

                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-semibold mb-0">{r.user.name}</h6>
                        <p className="text-muted small mb-0">{r.user.designation || "—"}</p>
                        <p className="text-muted small mb-1">{r.user.email}</p>
                        <Badge bg="success" style={{ fontSize: "0.65rem" }}>Active</Badge>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={deactivating === r.id}
                        onClick={() => setConfirmRes(r)}
                      >
                        {deactivating === r.id
                          ? <Spinner animation="border" size="sm" />
                          : "Deactivate"}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal show={!!confirmRes} onHide={() => setConfirmRes(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Deactivate Researcher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to deactivate:</p>
          <p className="fw-semibold">{confirmRes?.user.name}</p>
          <p className="text-muted small">
            They will lose access to the CoE dashboard. This can be reversed by re-inviting them.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmRes(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeactivateConfirm}>Yes, Deactivate</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ── Inactive placeholder (populate once backend returns inactive list) ────────
function InactiveResearchers() {
  return (
    <div className="mt-3">
      <p className="text-muted">No inactive researchers yet.</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OurTeam() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const section      = searchParams.get("section") || "active";

  const handleSelect = useCallback((key: string | null) => {
    if (!key) return;
    router.push(`/coemanager/Dashboard/OurTeam?section=${key}`);
  }, [router]);

  return (
    <div className="p-4">
      <h2 className="mb-4">Our Team</h2>

      <Nav variant="tabs" activeKey={section} onSelect={handleSelect} className="mb-4">
        <Nav.Item><Nav.Link eventKey="active">Active Members</Nav.Link></Nav.Item>
        {/* <Nav.Item><Nav.Link eventKey="inactive">Inactive Members</Nav.Link></Nav.Item> */}
        <Nav.Item><Nav.Link eventKey="onboardUser">+ Invite</Nav.Link></Nav.Item>
      </Nav>

      {section === "active"      && <ActiveResearchers />}
      {section === "inactive"    && <InactiveResearchers />}
      {section === "onboardUser" && <OnboardResearcherPage />}
    </div>
  );
}