"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import DasherBreadcrumb from "components/common/DasherBreadcrumb";
import Flex from "components/common/Flex";
import api from "helper/api";

interface OnboardResearcherInput {
  name: string;
  designation: string;
  email: string;
  role: string;
  orgId?: string;
}

export default function OnboardResearcherPage() {
  const [formData, setFormData] = useState<OnboardResearcherInput>({
    name: "",
    designation: "",
    email: "",
    role: "RESEARCHER",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/coes/researcher", formData);
      setMessage({ type: "success", text: res.data.message || "Invite sent!" });
      setFormData({ name: "", designation: "", email: "", role: "RESEARCHER" });
    } catch (err: any) {
      console.error("❌ Invite failed:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Page Header */}
      {/* <Row className="mb-4">
        <Col>
          <Flex justifyContent="between" alignItems="center">
            <div>
              <h1 className="mb-2 h2">Onboard Researcher</h1>
              <DasherBreadcrumb />
            </div>
          </Flex>
        </Col>
      </Row> */}

      {/* Form Card */}
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <h4 className="mb-4">Researcher Enrollment Form</h4>

              {message && (
                <Alert variant={message.type === "success" ? "success" : "danger"}>
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter researcher name"
                    required
                    className="form-focus-none"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Designation</Form.Label>
                  <Form.Control
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                    required
                    className="form-focus-none"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                    className="form-focus-none"
                  />
                </Form.Group>

                {/* Optional: if you want to allow assigning orgId */}
                {/* <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    name="orgId"
                    value={formData.orgId || ""}
                    onChange={handleChange}
                    placeholder="Enter org ID"
                    className="form-focus-none"
                  />
                </Form.Group> */}

                <Button
                  type="submit"
                  variant="dark"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Invite"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
