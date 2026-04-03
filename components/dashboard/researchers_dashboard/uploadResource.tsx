// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FileText, UploadCloud, CheckCircle2 } from "lucide-react";
// import {
//   Card,
//   Button,
//   Form,
//   Row,
//   Col,
//   ProgressBar,
//   Spinner,
// } from "react-bootstrap";
// import api from "helper/api"; // ✅ your axios wrapper

// export default function UploadResourceWizard() {
//   const [step, setStep] = useState(1);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   // ✅ NEW: working areas list
//   const [workingAreas, setWorkingAreas] = useState<
//     { id: string; name: string }[]
//   >([]);
//   const [options, setOptions] = useState<{
//     clusterTags: string[];
//     regions: string[];
//     years: string[];
//     resourceTypes: string[];
//   }>({
//     clusterTags: [],
//     regions: [],
//     years: [],
//     resourceTypes: [],
//   });

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     type: "",
//     year: "",
//     region: "",
//     clusterTag: "",
//     workingAreaId: "",
//     file: null as File | null,
//   });

//   // 🎯 Fetch enums from backend
//   useEffect(() => {
//     async function fetchEnums() {
//       try {
//         const res = await api.get("/users/resource-options");
//         setOptions(res.data);
//       } catch (err) {
//         console.error("Failed to load enums", err);
//       }
//     }
//     fetchEnums();
//   }, []);

//    // ✅ NEW: Fetch working areas for logged-in org
//   useEffect(() => {
//     async function fetchWorkingAreas() {
//       try {
//         const res = await api.get("/coes/working-area");
//         setWorkingAreas(res.data);
//       } catch (err) {
//         console.error("Failed to load working areas", err);
//       }
//     }
//     fetchWorkingAreas();
//   }, []);

//   const stepInfo = [
//     {
//       title: "Add Metadata",
//       icon: <FileText size={36} color="#0d6efd" />,
//       desc: "Enter details like title, description, and type of your resource.",
//     },
//     {
//       title: "Upload File",
//       icon: <UploadCloud size={36} color="#6610f2" />,
//       desc: "Upload your file (PDF, DOCX, XLSX etc.).",
//     },
//     {
//       title: "Review & Submit",
//       icon: <CheckCircle2 size={36} color="#198754" />,
//       desc: "Verify all data and submit for approval.",
//     },
//   ];

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setForm((p) => ({ ...p, file }));
//       setFileName(file.name);
//     }
//   };

//   const handleNext = () => setStep((s) => Math.min(3, s + 1));
//   const handleBack = () => setStep((s) => Math.max(1, s - 1));

//   async function handleSubmit() {
//     if (!form.file) return alert("Please upload a file first.");
//     setUploading(true);

//     const data = new FormData();
//     Object.entries(form).forEach(([k, v]) => {
//       if (v) data.append(k, v as any);
//     });

//     try {
//       await api.post("/users/upload-resource", data, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (e) => {
//           if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
//         },
//       });
//       setProgress(100);
//       setTimeout(() => alert("✅ Upload completed successfully!"), 600);
//     } catch (err) {
//       console.error(err);
//       alert("❌ Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   }

//   return (
//     <Row className="bg-light rounded-4 border overflow-hidden">
//       {/* LEFT PANEL */}
//       <Col md={5} className="bg-white border-end d-flex flex-column justify-content-center p-4">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={step}
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 30 }}
//             transition={{ duration: 0.5 }}
//             className="text-center"
//           >
//             <div className="mb-3">{stepInfo[step - 1].icon}</div>
//             <h4>{stepInfo[step - 1].title}</h4>
//             <p className="text-muted">{stepInfo[step - 1].desc}</p>
//             <div className="mt-4">
//               <ProgressBar now={(step / 3) * 100} />
//               <small className="text-muted d-block mt-2">
//                 Step {step} of 3
//               </small>
//             </div>
//           </motion.div>
//         </AnimatePresence>
//       </Col>

//       {/* RIGHT PANEL */}
//       <Col md={7} className="p-4">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={step}
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -40 }}
//             transition={{ duration: 0.4 }}
//           >
//             {/* STEP 1 */}
//             {step === 1 && (
//               <Card className="shadow-sm">
//                 <Card.Header>📘 Resource Metadata</Card.Header>
//                 <Card.Body>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Title</Form.Label>
//                     <Form.Control
//                       name="title"
//                       value={form.title}
//                       onChange={handleChange}
//                       placeholder="Enter title"
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Description</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={3}
//                       name="description"
//                       value={form.description}
//                       onChange={handleChange}
//                       placeholder="Describe your resource..."
//                     />
//                   </Form.Group>

//                   <Row>
//                     <Col>
//                       <Form.Group className="mb-3">
//                         <Form.Label>Type</Form.Label>
//                         <Form.Select name="type" value={form.type} onChange={handleChange}>
//                           <option value="">Select Type</option>
//                           {options.resourceTypes.map((t) => (
//                             <option key={t} value={t}>{t}</option>
//                           ))}
//                         </Form.Select>
//                       </Form.Group>
//                     </Col>
//                     <Col>
//                       <Form.Group className="mb-3">
//                         <Form.Label>Year</Form.Label>
//                         <Form.Select name="year" value={form.year} onChange={handleChange}>
//                           <option value="">Select Year</option>
//                           {options.years.map((y) => (
//                             <option key={y} value={y}>
//                               {y.replace("YEAR_", "")}
//                             </option>
//                           ))}
//                         </Form.Select>
//                       </Form.Group>
//                     </Col>
//                   </Row>

//                   <Row>
//                     <Col>
//                       <Form.Group className="mb-3">
//                         <Form.Label>Region</Form.Label>
//                         <Form.Select name="region" value={form.region} onChange={handleChange}>
//                           <option value="">Select Region</option>
//                           {options.regions.map((r) => (
//                             <option key={r} value={r}>{r}</option>
//                           ))}
//                         </Form.Select>
//                       </Form.Group>
//                     </Col>
//                     <Col>
//                       <Form.Group className="mb-3">
//                         <Form.Label>Cluster Tag</Form.Label>
//                         <Form.Select
//                           name="clusterTag"
//                           value={form.clusterTag}
//                           onChange={handleChange}
//                         >
//                           <option value="">Select Cluster</option>
//                           {options.clusterTags.map((c) => (
//                             <option key={c} value={c}>{c}</option>
//                           ))}
//                         </Form.Select>
//                       </Form.Group>
//                     </Col>
//                   </Row>
//                 {/* ✅ NEW: Working Area Select */}
//                   <Form.Group className="mb-3">
//                     <Form.Label>Working Area</Form.Label>
//                     <Form.Select
//                       name="workingAreaId"
//                       value={form.workingAreaId}
//                       onChange={handleChange}
//                     >
//                       <option value="">Select Working Area</option>
//                       {workingAreas.map((wa) => (
//                         <option key={wa.id} value={wa.id}>
//                           {wa.name}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                   <div className="d-flex justify-content-end">
//                     <Button variant="primary" onClick={handleNext}>
//                       Next →
//                     </Button>
//                   </div>
//                 </Card.Body>
//               </Card>
//             )}

//             {/* STEP 2 */}
//             {step === 2 && (
//               <Card className="shadow-sm">
//                 <Card.Header>📤 Upload Resource</Card.Header>
//                 <Card.Body>
//                   <Form.Group>
//                     <Form.Label>File Upload</Form.Label>
//                     <Form.Control type="file" onChange={handleFile} />
//                     {fileName && <div className="mt-2 text-muted">📄 {fileName}</div>}
//                   </Form.Group>

//                   <div className="d-flex justify-content-between mt-4">
//                     <Button variant="outline-secondary" onClick={handleBack}>
//                       ← Back
//                     </Button>
//                     <Button variant="primary" onClick={handleNext} disabled={!fileName}>
//                       Next →
//                     </Button>
//                   </div>
//                 </Card.Body>
//               </Card>
//             )}

//             {/* STEP 3 */}
//             {step === 3 && (
//               <Card className="shadow-sm">
//                 <Card.Header>✅ Review & Submit</Card.Header>
//                 <Card.Body>
//                   <ul className="list-unstyled small mb-4">
//                     <li><b>Title:</b> {form.title}</li>
//                     <li><b>Description:</b> {form.description}</li>
//                     <li><b>Type:</b> {form.type}</li>
//                     <li><b>Year:</b> {form.year}</li>
//                     <li><b>Region:</b> {form.region}</li>
//                     <li><b>Cluster:</b> {form.clusterTag}</li>
//                     <li><b>File:</b> {fileName}</li>
//                   </ul>

//                   {uploading && (
//                     <div className="mb-3">
//                       <ProgressBar now={progress} label={`${progress}%`} animated />
//                     </div>
//                   )}

//                   <div className="d-flex justify-content-between">
//                     <Button variant="outline-secondary" onClick={handleBack}>
//                       ← Back
//                     </Button>
//                     <Button variant="success" onClick={handleSubmit} disabled={uploading}>
//                       {uploading ? (
//                         <>
//                           <Spinner
//                             animation="border"
//                             size="sm"
//                             className="me-2"
//                           /> Uploading...
//                         </>
//                       ) : (
//                         "Submit"
//                       )}
//                     </Button>
//                   </div>
//                 </Card.Body>
//               </Card>
//             )}
//           </motion.div>
//         </AnimatePresence>
//       </Col>
//     </Row>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, UploadCloud, CheckCircle2 } from "lucide-react";
import {
  Card, Button, Form, Row, Col, ProgressBar, Spinner,
} from "react-bootstrap";
import api from "helper/api";

export default function UploadResourceWizard() {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [workingAreas, setWorkingAreas] = useState<{ id: string; name: string }[]>([]);
  const [options, setOptions] = useState<{
    clusterTags: string[]; regions: string[]; years: string[]; resourceTypes: string[];
  }>({ clusterTags: [], regions: [], years: [], resourceTypes: [] });

  const [form, setForm] = useState({
    title: "", description: "", type: "", year: "",
    clusterTag: "", workingAreaId: "", file: null as File | null,
  });

  useEffect(() => {
    api.get("/users/resource-options").then(r => setOptions(r.data)).catch(console.error);
    api.get("/coes/working-area").then(r => setWorkingAreas(r.data)).catch(console.error);
  }, []);

  const stepInfo = [
    { title: "Add Metadata",    icon: <FileText    size={36} color="#0d6efd" />, desc: "Enter details like title, description, and type of your resource." },
    { title: "Upload File",     icon: <UploadCloud size={36} color="#6610f2" />, desc: "Upload your file (PDF, DOCX, XLSX etc.)." },
    { title: "Review & Submit", icon: <CheckCircle2 size={36} color="#198754" />, desc: "Verify all data and submit for approval." },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(p => ({ ...p, file }));
      setFileName(file.name);
      if (errors.file) setErrors(p => { const n = { ...p }; delete n.file; return n; });
    }
  };

  // ── Validation per step ───────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim())       e.title       = "Title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.type)               e.type        = "Please select a type.";
    if (!form.year)               e.year        = "Please select a year.";
    if (!form.clusterTag)         e.clusterTag  = "Please select a cluster tag.";
    if (!form.workingAreaId)      e.workingAreaId = "Please select a working area.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (!form.file) {
      setErrors({ file: "Please upload a file before proceeding." });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => Math.max(1, s - 1));
  };

  async function handleSubmit() {
    if (!form.file) return;
    setUploading(true);
    const data = new FormData();
   Object.entries(form).forEach(([k, v]) => {
  if (v) data.append(k, v as any);
});

// ✅ FORCE region = ALL
data.append("region", "ALL");

    try {
      await api.post("/users/upload-resource", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => { if (e.total) setProgress(Math.round((e.loaded / e.total) * 100)); },
      });
      setProgress(100);
      setTimeout(() => alert("✅ Upload completed successfully!"), 600);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // Helper — field error message
  const Err = ({ field }: { field: string }) =>
    errors[field] ? <div className="text-danger small mt-1">{errors[field]}</div> : null;

  return (
    <Row className="bg-light rounded-4 border overflow-hidden">
      {/* LEFT PANEL */}
      <Col md={5} className="bg-white border-end d-flex flex-column justify-content-center p-4">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-3">{stepInfo[step - 1].icon}</div>
            <h4>{stepInfo[step - 1].title}</h4>
            <p className="text-muted">{stepInfo[step - 1].desc}</p>
            <div className="mt-4">
              <ProgressBar now={(step / 3) * 100} />
              <small className="text-muted d-block mt-2">Step {step} of 3</small>
            </div>
          </motion.div>
        </AnimatePresence>
      </Col>

      {/* RIGHT PANEL */}
      <Col md={7} className="p-4">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.4 }}
          >

            {/* STEP 1 */}
            {step === 1 && (
              <Card className="shadow-sm">
                <Card.Header>📘 Resource Metadata</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control name="title" value={form.title} onChange={handleChange}
                      placeholder="Enter title" isInvalid={!!errors.title} />
                    <Err field="title" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control as="textarea" rows={3} name="description"
                      value={form.description} onChange={handleChange}
                      placeholder="Describe your resource..." isInvalid={!!errors.description} />
                    <Err field="description" />
                  </Form.Group>

                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Type <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="type" value={form.type} onChange={handleChange}
                          isInvalid={!!errors.type}>
                          <option value="">Select Type</option>
                          {options.resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </Form.Select>
                        <Err field="type" />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Year <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="year" value={form.year} onChange={handleChange}
                          isInvalid={!!errors.year}>
                          <option value="">Select Year</option>
                          {options.years.map(y => <option key={y} value={y}>{y.replace("YEAR_", "")}</option>)}
                        </Form.Select>
                        <Err field="year" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      {/* <Form.Group className="mb-3">
                        <Form.Label>Region <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="region" value={form.region} onChange={handleChange}
                          isInvalid={!!errors.region}>
                          <option value="">Select Region</option>
                          {options.regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </Form.Select>
                        <Err field="region" />
                      </Form.Group> */}
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Cluster Tag <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="clusterTag" value={form.clusterTag} onChange={handleChange}
                          isInvalid={!!errors.clusterTag}>
                          <option value="">Select Cluster</option>
                          {options.clusterTags.map(c => <option key={c} value={c}>{c}</option>)}
                        </Form.Select>
                        <Err field="clusterTag" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Working Area <span className="text-danger">*</span></Form.Label>
                    <Form.Select name="workingAreaId" value={form.workingAreaId} onChange={handleChange}
                      isInvalid={!!errors.workingAreaId}>
                      <option value="">Select Working Area</option>
                      {workingAreas.map(wa => <option key={wa.id} value={wa.id}>{wa.name}</option>)}
                    </Form.Select>
                    <Err field="workingAreaId" />
                  </Form.Group>

                  {Object.keys(errors).length > 0 && (
                    <div className="alert alert-danger py-2 small mb-3">
                      Please fill in all required fields before proceeding.
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleNext}>Next →</Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <Card className="shadow-sm">
                <Card.Header>📤 Upload Resource</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>File Upload <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="file" onChange={handleFile} isInvalid={!!errors.file} />
                    {fileName && <div className="mt-2 text-muted">📄 {fileName}</div>}
                    <Err field="file" />
                  </Form.Group>

                  <div className="d-flex justify-content-between mt-4">
                    <Button variant="outline-secondary" onClick={handleBack}>← Back</Button>
                    <Button variant="primary" onClick={handleNext}>Next →</Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <Card className="shadow-sm">
                <Card.Header>✅ Review & Submit</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled small mb-4">
                    <li><b>Title:</b> {form.title}</li>
                    <li><b>Description:</b> {form.description}</li>
                    <li><b>Type:</b> {form.type}</li>
                    <li><b>Year:</b> {form.year}</li>
                    {/* <li><b>Region:</b> {form.region}</li> */}
                    <li><b>Cluster:</b> {form.clusterTag}</li>
                    <li><b>Working Area:</b> {workingAreas.find(w => w.id === form.workingAreaId)?.name || "—"}</li>
                    <li><b>File:</b> {fileName}</li>
                  </ul>

                  {uploading && (
                    <div className="mb-3">
                      <ProgressBar now={progress} label={`${progress}%`} animated />
                    </div>
                  )}

                  <div className="d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={handleBack} disabled={uploading}>← Back</Button>
                    <Button variant="success" onClick={handleSubmit} disabled={uploading}>
                      {uploading
                        ? <><Spinner animation="border" size="sm" className="me-2" />Uploading...</>
                        : "Submit"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}

          </motion.div>
        </AnimatePresence>
      </Col>
    </Row>
  );
}