// "use client";

// import { useEffect, useState } from "react";
// import {
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Alert,
//   Dropdown,
//   DropdownButton,
// } from "react-bootstrap";
// import DasherBreadcrumb from "components/common/DasherBreadcrumb";
// import Flex from "components/common/Flex";
// import api from "helper/api";
// import { InviteCoEInput } from "types/inviteCoe";

// export default function InviteCoEPage() {
//   const [formData, setFormData] = useState<InviteCoEInput>({
//     email: "",
//     orgName: "",
//     state: "",
//     subTypeId: "",
//     role: "COE_MANAGER",
//   });

//   const [subTypes, setSubTypes] = useState<{ id: string; name: string }[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<{
//     type: "success" | "error";
//     text: string;
//   } | null>(null);

//   // 🔽 Load OrgSubTypes
//   useEffect(() => {
//     api
//       .get("/admin/org-subtypes")
//       .then((res) => setSubTypes(res.data))
//       .catch((err) => console.error("❌ Failed to load org subtypes", err));
//   }, []);

// const handleChange = (
//   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
// ) => {
//   const { name, value } = e.target;
//   setFormData((prev) => ({ ...prev, [name]: value }));
// };


// const handleSubTypeSelect: (eventKey: string | null) => void = (eventKey) => {
//   if (eventKey) {
//     setFormData((prev) => ({ ...prev, subTypeId: eventKey }));
//   }
// };

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setLoading(true);
//   setMessage(null);

//   try {
//     const formPayload = new FormData();

//     Object.entries(formData).forEach(([key, value]) => {
//       if (value) formPayload.append(key, value as any);
//     });

//     // 🔽 If domain is given → get Clearbit logo
//     if ((formData as any).domain && !(formData as any).file) {
//       const logoUrl = `https://logo.clearbit.com/${(formData as any).domain}`;
//       formPayload.append("logoUrl", logoUrl);
//     }

//     const res = await api.post("/admin/invite-coe", formPayload, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     setMessage({ type: "success", text: res.data.message });
//     setFormData({
//       email: "",
//       orgName: "",
//       state: "",
//       subTypeId: "",
//       role: "COE_MANAGER",
//     });
//   } catch (err: any) {
//     console.error("❌ Invite failed:", err);
//     setMessage({
//       type: "error",
//       text: err.response?.data?.message || "Something went wrong!",
//     });
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="p-4">
//       {/* Page Header */}
//       <Row className="mb-4">
//         <Col>
//           <Flex justifyContent="between" alignItems="center">
//             <div>
//               <h1 className="mb-2 h2">Onboard  Center of Excellence</h1>
//               <DasherBreadcrumb />
//             </div>
//           </Flex>
//         </Col>
//       </Row>

//       {/* Form Card */}
//       <Row className="justify-content-center">
//         <Col md={8} lg={6}>
//           <Card className="shadow-sm border-0 rounded-3">
//             <Card.Body>
//               <h4 className="mb-4">Organization Enrollment Form</h4>

//               {message && (
//                 <Alert
//                   variant={message.type === "success" ? "success" : "danger"}
//                 >
//                   {message.text}
//                 </Alert>
//               )}

                          
//               <Form.Group className="mb-3">
//   <Form.Label>Organization Website (Domain)</Form.Label>
//   <Form.Control
//     type="text"
//     name="domain"
//     value={(formData as any).domain || ""}
//     onChange={handleChange}
//     placeholder="e.g. iitd.ac.in"
//     className="form-focus-none"
//   />
//   <Form.Text className="text-muted">
//     If provided, we will auto-fetch the logo from Clearbit.
//   </Form.Text>
// </Form.Group>

// <Form.Group className="mb-3">
//   <Form.Label>Upload Logo (Optional)</Form.Label>
//   <Form.Control
//     type="file"
//     name="file"
//     accept="image/*"
//     onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (file) {
//         setFormData((prev) => ({ ...prev, file }));
//       }
//     }}
//   />
// </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Organization Name</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="orgName"
//                     value={formData.orgName}
//                     onChange={handleChange}
//                     placeholder="Enter organization name"
//                     required
//                     className="form-focus-none"
//                   />
//                 </Form.Group>
//                 <Form onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Email</Form.Label>
//                   <Form.Control
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter manager email"
//                     required
//                     className="form-focus-none"
//                   />
//                 </Form.Group>


//                 <Form.Group className="mb-3">
//                   <Form.Label>State</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     placeholder="Enter state"
//                     className="form-focus-none"
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-4">
//                   <Form.Label>Category</Form.Label>
//                   <DropdownButton
//   id="dropdown-subtype"
//   title={
//     formData.subTypeId
//       ? subTypes.find((st) => st.id === formData.subTypeId)?.name || "Select category"
//       : "Select category"
//   }
//   onSelect={handleSubTypeSelect} // ✅ no error
//   className="w-100"
// >
//   {subTypes.map((st) => (
//     <Dropdown.Item key={st.id} eventKey={st.id}>
//       {st.name}
//     </Dropdown.Item>
//   ))}
// </DropdownButton>

//                 </Form.Group>

//                 <Button
//                   type="submit"
//                   variant="dark"
//                   className="w-100"
//                   disabled={loading}
//                 >
//                   {loading ? "Sending..." : "Send Invite"}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import {
  Row, Col, Card, Form, Button, Alert,
  Dropdown, DropdownButton, Image,
} from "react-bootstrap";
import DasherBreadcrumb from "components/common/DasherBreadcrumb";
import Flex from "components/common/Flex";
import api from "helper/api";

// ✅ Cleaned up type — no file, logoUrl is built from domain
type InviteCoEInput = {
  email: string;
  orgName: string;
  state: string;
  subTypeId: string;
  role: "COE_MANAGER";
  managerName: string;
  
  logoUrl?: string;  // sent to backend
};

const EMPTY_FORM: InviteCoEInput = {
  email: "",
  orgName: "",
  state: "",
  subTypeId: "",
  role: "COE_MANAGER",
  managerName: "",
  logoUrl: "",
};

export default function InviteCoEPage() {
  const [formData, setFormData] = useState<InviteCoEInput>(EMPTY_FORM);
  const [subTypes, setSubTypes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // preview URL derived from domain
  

  useEffect(() => {
    api
      .get("/admin/org-subtypes")
      .then((res) => setSubTypes(res.data))
      .catch((err) => console.error("❌ Failed to load org subtypes", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubTypeSelect = (eventKey: string | null) => {
    if (eventKey) setFormData((prev) => ({ ...prev, subTypeId: eventKey }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // ✅ Plain JSON — no FormData, no multipart
      const payload = {
        email:     formData.email,
        orgName:   formData.orgName,
        state:     formData.state,
        subTypeId: formData.subTypeId,
        role:      formData.role,
        logoUrl:   formData.logoUrl || undefined,
         managerName: formData.managerName,  // ✅ direct URL
      };

      const res = await api.post("/admin/invite-coe", payload);
      setMessage({ type: "success", text: res.data.message });
      setFormData(EMPTY_FORM);
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
      <Row className="mb-4">
        <Col>
          <Flex justifyContent="between" alignItems="center">
            <div>
              <h1 className="mb-2 h2">Onboard Center of Excellence</h1>
              <DasherBreadcrumb />
            </div>
          </Flex>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <h4 className="mb-4">Organization Enrollment Form</h4>

              {message && (
                <Alert variant={message.type === "success" ? "success" : "danger"}>
                  {message.text}
                </Alert>
              )}

              {/* ✅ Single form wrapping everything */}
              <Form onSubmit={handleSubmit}>

                {/* Domain → auto logo */}
              {/* ✅ Direct logo URL input */}
<Form.Group className="mb-3">
  <Form.Label>Organization Logo URL</Form.Label>
  <Form.Control
    type="text"
    name="logoUrl"
    value={formData.logoUrl || ""}
    onChange={handleChange}
    placeholder="https://example.com/logo.png"
    className="form-focus-none"
  />
  <Form.Text className="text-muted">
    Paste a direct link to the organization logo image.
  </Form.Text>
</Form.Group>

{/* ✅ Live logo preview */}
{formData.logoUrl && (
  <div className="mb-3 d-flex align-items-center gap-2">
    <Image
      src={formData.logoUrl}
      alt="Logo preview"
      width={40}
      height={40}
      className="rounded border"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
    <span className="text-muted small">Logo preview</span>
  </div>
)}

                <Form.Group className="mb-3">
                  <Form.Label>Organization Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleChange}
                    placeholder="Enter organization name"
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
                    placeholder="Enter manager email"
                    required
                    className="form-focus-none"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className="form-focus-none"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Category</Form.Label>
                  <DropdownButton
                    id="dropdown-subtype"
                    title={
                      formData.subTypeId
                        ? subTypes.find((st) => st.id === formData.subTypeId)?.name
                          ?? "Select category"
                        : "Select category"
                    }
                    onSelect={handleSubTypeSelect}
                    className="w-100"
                  >
                    {subTypes.map((st) => (
                      <Dropdown.Item key={st.id} eventKey={st.id}>
                        {st.name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </Form.Group>
<Form.Group className="mb-3">
  <Form.Label>CoE Manager Name</Form.Label>
  <Form.Control
    type="text"
    name="managerName"
    value={formData.managerName}
    onChange={handleChange}
    placeholder="Enter manager name"
    required
  />
</Form.Group>

                <Button type="submit" variant="dark" className="w-100" disabled={loading}>
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