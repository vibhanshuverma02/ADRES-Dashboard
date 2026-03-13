// // "use client";

// // import { useAuth } from "context/Authcontext";
// // import { useRouter } from "next/navigation";
// // import { useState, useEffect } from "react";
// // import api from "helper/api";

// // export default function SetupAreasPage() {
// //   const { user , } = useAuth();
// //   const router = useRouter();
// //   const [areas, setAreas] = useState<{ id?: string; name: string; description?: string }[]>([
// //     { name: "" },
// //   ]);
// //   const [loading, setLoading] = useState(true);

// //   // --- Fetch existing areas if user has already setup partially ---
// //   useEffect(() => {
// //     if (!user?.sub) return;

// //     const fetchAreas = async () => {
// //       try {
// //         const res = await api.get(`/coes/working-area`);
// //         if (res?.data?.length) {
// //           // Map existing areas into editable state
// //           setAreas(
// //             res.data.map((a: any) => ({
// //               id: a.id,
// //               name: a.name,
// //               description: a.description ?? "",
// //             }))
// //           );
// //         }
// //       } catch (err) {
// //         console.error("Failed to fetch existing areas", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchAreas();
// //   }, [user]);

// //   const handleAddArea = () => setAreas([...areas, { name: "" }]);

// //   const handleChange = (i: number, val: string) => {
// //     const copy = [...areas];
// //     copy[i].name = val;
// //     setAreas(copy);
// //   };

// // const handleSave = async () => {
// //   if (!areas.every((a) => a.name.trim() !== "")) {
// //     alert("Please fill in all area names before saving.");
// //     return;
// //   }

// //   try {
// //     // Save or update areas
// //     await api.post(`/coes/Edit-area`, { areas });

// //     // ✅ Wait briefly to ensure DB update propagation (optional safeguard)
// //     await new Promise((r) => setTimeout(r, 200));

// //     // 🔄 Refresh user session (this time will return firstlogin=false)
// //     const refreshRes = await api.post(`/auth/refresh`);
// //     if (!refreshRes?.data?.accessToken) {
// //       throw new Error("Refresh failed");
// //     }

// //     router.push("/coemanager/Dashboard");
// //   } catch (err) {
// //     console.error("Failed to save areas", err);
// //     alert("Failed to save areas. Please try again.");
// //   }
// // };

// //   if (loading) return <div className="p-6">Loading...</div>;

// //   return (
// //     <div className="p-6 max-w-lg mx-auto">
// //       <h2 className="text-2xl font-semibold mb-4">Set up your CoE Working Areas</h2>

// //       {areas.map((area, i) => (
// //         <input
// //           key={area.id ?? i}
// //           value={area.name}
// //           onChange={(e) => handleChange(i, e.target.value)}
// //           placeholder={`Working Area ${i + 1}`}
// //           className="border p-2 mb-2 w-full rounded"
// //         />
// //       ))}

// //       <div className="flex mt-4">
// //         <button
// //           onClick={handleAddArea}
// //           className="bg-gray-100 px-3 py-1 rounded mr-3"
// //         >
// //           + Add Another
// //         </button>

// //         <button
// //           onClick={handleSave}
// //           className="bg-blue-600 text-white px-4 py-2 rounded"
// //         >
// //           Save & Continue
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }



// "use client";

// import { useAuth } from "context/Authcontext";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import api from "helper/api";

// interface Area {
//   id?: string;
//   name: string;
//   description?: string;
// }

// export default function SetupAreasPage() {
//   const { user } = useAuth();
//   const router = useRouter();

//   const [areas, setAreas] = useState<Area[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [newArea, setNewArea] = useState<Area>({ name: "", description: "" });
//   const [editingArea, setEditingArea] = useState<string | null>(null);
//   const [saving, setSaving] = useState(false);

//   // --- Fetch all areas for this org ---
//   useEffect(() => {
//     if (!user?.sub) return;

//     const fetchAreas = async () => {
//       try {
//         const res = await api.get(`/coes/working-area`);
//         setAreas(res?.data || []);
//       } catch (err) {
//         console.error("Failed to fetch existing areas", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAreas();
//   }, [user]);

//   // --- Handle add new working area ---
//   const handleCreate = async () => {
//     if (!newArea.name.trim()) {
//       alert("Please enter a working area name.");
//       return;
//     }

//     setSaving(true);
//     try {
//       await api.post(`/coes/Edit-area`, { areas: [newArea] });
//       setNewArea({ name: "", description: "" });
//       const res = await api.get(`/coes/working-area`);
//       setAreas(res?.data || []);
//     } catch (err) {
//       console.error("Failed to create area", err);
//       alert("❌ Failed to create area. Try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // --- Handle update existing area ---
//   const handleUpdate = async (area: Area) => {
//     if (!area.name.trim()) {
//       alert("Name cannot be empty.");
//       return;
//     }

//     setSaving(true);
//     try {
//       await api.post(`/coes/Edit-area`, { areas: [area] });
//       setEditingArea(null);
//       const res = await api.get(`/coes/working-area`);
//       setAreas(res?.data || []);
//     } catch (err) {
//       console.error("Failed to update area", err);
//       alert("❌ Failed to update area.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // --- Handle delete ---
//   const handleDelete = async (id?: string) => {
//     if (!id) return;
//     if (!confirm("Are you sure you want to delete this area?")) return;

//     setSaving(true);
//     try {
//       await api.delete(`/coes/delete/${id}`);
//       setAreas((prev) => prev.filter((a) => a.id !== id));
//     } catch (err) {
//       console.error("Failed to delete area", err);
//       alert("❌ Failed to delete area.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h2 className="text-2xl font-semibold mb-4">Manage CoE Working Areas</h2>

//       {/* 🟩 SECTION 1: Active Working Areas */}
//       <div className="mb-8 border rounded-lg p-4 shadow-sm bg-white">
//         <h3 className="text-lg font-semibold mb-3 text-blue-700">
//           Active Working Areas
//         </h3>

//         {areas.length === 0 && (
//           <p className="text-gray-500">No working areas found.</p>
//         )}

//         {areas.map((area) => (
//           <div
//             key={area.id}
//             className="border-b py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between"
//           >
//             {editingArea === area.id ? (
//               <div className="flex flex-col w-full gap-2">
//                 <input
//                   type="text"
//                   value={area.name}
//                   onChange={(e) =>
//                     setAreas((prev) =>
//                       prev.map((a) =>
//                         a.id === area.id ? { ...a, name: e.target.value } : a
//                       )
//                     )
//                   }
//                   className="border rounded p-2 w-full"
//                   placeholder="Area name"
//                 />
//                 <textarea
//                   value={area.description || ""}
//                   onChange={(e) =>
//                     setAreas((prev) =>
//                       prev.map((a) =>
//                         a.id === area.id
//                           ? { ...a, description: e.target.value }
//                           : a
//                       )
//                     )
//                   }
//                   className="border rounded p-2 w-full"
//                   placeholder="Description (optional)"
//                 />
//                 <div className="flex gap-2 mt-2">
//                   <button
//                     onClick={() => handleUpdate(area)}
//                     disabled={saving}
//                     className="bg-blue-600 text-white px-3 py-1 rounded"
//                   >
//                     {saving ? "Saving..." : "Update"}
//                   </button>
//                   <button
//                     onClick={() => setEditingArea(null)}
//                     className="bg-gray-200 px-3 py-1 rounded"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
//                 <div>
//                   <p className="font-medium text-gray-800">{area.name}   <button
//                     onClick={() => setEditingArea(area.id!)}
//                     className="text-blue-600 hover:underline"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(area.id)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                  <button
//   onClick={() => router.push(`/coemanager/Dashboard/Resource?section=Pending&area=${encodeURIComponent(area.name)}`)}
//   className="text-blue-600 hover:underline ml-3"
// >
//   View Resources
// </button>
// </p>

                  
//                   {area.description && (
//                     <p className="text-sm text-gray-500">{area.description}</p>
//                   )}
            
//                 {/* <div className="flex gap-3 mt-2 sm:mt-0"> */}
                
//                 {/* </div> */}
//               </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* 🟦 SECTION 2: Add New Working Area */}
//       <div className="border rounded-lg p-4 shadow-sm bg-white">
//         <h3 className="text-lg font-semibold mb-3 text-green-700">
//           Add New Working Area
//         </h3>

//         <input
//           type="text"
//           value={newArea.name}
//           onChange={(e) =>
//             setNewArea({ ...newArea, name: e.target.value })
//           }
//           placeholder="Enter new working area name"
//           className="border p-2 rounded w-full mb-2"
//         />
//         <textarea
//           value={newArea.description}
//           onChange={(e) =>
//             setNewArea({ ...newArea, description: e.target.value })
//           }
//           placeholder="Description (optional)"
//           className="border p-2 rounded w-full mb-3"
//         />

//         <button
//           onClick={handleCreate}
//           disabled={saving}
//           className="bg-green-600 text-white px-4 py-2 rounded"
//         >
//           {saving ? "Creating..." : "Create New Area"}
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useAuth } from "context/Authcontext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import api from "helper/api";

interface Area {
  id?: string;
  name: string;
  description?: string;
}

export default function SetupAreasPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArea, setNewArea] = useState<Area>({ name: "", description: "" });
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false); // <-- new state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.sub) return;

    const fetchAreas = async () => {
      try {
        const res = await api.get(`/coes/working-area`);
        setAreas(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch existing areas", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [user]);

  const handleCreate = async () => {
    if (!newArea.name.trim()) return alert("Please enter a working area name.");

    setSaving(true);
    try {
      await api.post(`/coes/Edit-area`, { areas: [newArea] });
      setNewArea({ name: "", description: "" });
      setAddingNew(false); // <-- hide the form after creation
      const res = await api.get(`/coes/working-area`);
      setAreas(res?.data || []);
    } catch (err) {
      console.error("Failed to create area", err);
      alert("❌ Failed to create area. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (area: Area) => {
    if (!area.name.trim()) return alert("Name cannot be empty.");

    setSaving(true);
    try {
      await api.post(`/coes/Edit-area`, { areas: [area] });
      setEditingArea(null);
      const res = await api.get(`/coes/working-area`);
      setAreas(res?.data || []);
    } catch (err) {
      console.error("Failed to update area", err);
      alert("❌ Failed to update area.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this area?")) return;

    setSaving(true);
    try {
      await api.delete(`/coes/delete/${id}`);
      setAreas((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete area", err);
      alert("❌ Failed to delete area.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center p-6">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="mb-4 text-primary">Manage CoE Working Areas</h2>

      {/* Existing Areas */}
      <Card className="mb-5 shadow-sm">
        <Card.Header className="bg-primary text-white">
          Active Working Areas
        </Card.Header>
        <Card.Body>
          {areas.length === 0 && (
            <p className="text-muted">No working areas found.</p>
          )}
          {areas.map((area) => (
            <Row
              key={area.id}
              className="align-items-center border-bottom py-2"
            >
              <Col xs={12} sm={6}>
                {editingArea === area.id ? (
                  <>
                    <Form.Control
                      className="mb-2"
                      value={area.name}
                      onChange={(e) =>
                        setAreas((prev) =>
                          prev.map((a) =>
                            a.id === area.id
                              ? { ...a, name: e.target.value }
                              : a
                          )
                        )
                      }
                      placeholder="Area Name"
                    />
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={area.description || ""}
                      onChange={(e) =>
                        setAreas((prev) =>
                          prev.map((a) =>
                            a.id === area.id
                              ? { ...a, description: e.target.value }
                              : a
                          )
                        )
                      }
                      placeholder="Description (optional)"
                    />
                  </>
                ) : (
                  <>
                    <strong>{area.name}</strong>
                    {area.description && (
                      <p className="text-muted mb-0">{area.description}</p>
                    )}
                  </>
                )}
              </Col>
              <Col
                xs={12}
                sm={6}
                className="d-flex justify-content-sm-end gap-2 mt-2 mt-sm-0"
              >
                {editingArea === area.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUpdate(area)}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Update"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingArea(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => setEditingArea(area.id!)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(area.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() =>
                        router.push(
                          `/coemanager/Dashboard/Resource?section=Pending&area=${encodeURIComponent(
                            area.name
                          )}`
                        )
                      }
                    >
                      View Resources
                    </Button>
                  </>
                )}
              </Col>
            </Row>
          ))}

          {/* Button to show new area form */}
          {!addingNew && (
            <div className="mt-3">
              <Button variant="success" onClick={() => setAddingNew(true)}>
                + Add New Area
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add New Area Form */}
      {addingNew && (
        <Card className="shadow-sm mb-5">
          <Card.Header className="bg-success text-white">
            Add New Working Area
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Area Name</Form.Label>
              <Form.Control
                type="text"
                value={newArea.name}
                onChange={(e) =>
                  setNewArea({ ...newArea, name: e.target.value })
                }
                placeholder="Enter new working area name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newArea.description}
                onChange={(e) =>
                  setNewArea({ ...newArea, description: e.target.value })
                }
                placeholder="Description"
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create New Area"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setAddingNew(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}


