// "use client";

// import React, { useEffect, useState, useCallback, memo } from "react";
// import api from "helper/api";

// // ✅ WorkingArea type
// export interface WorkingArea {
//   id: string;
//   name: string;
// }

// interface WorkingAreaFilterProps {
//   onSelect: (area: WorkingArea | null) => void;
//   defaultLabel?: string;
//   defaultValue?: string;
//   className?: string;
// }

// // ✅ Memoized component
// const WorkingAreaFilter: React.FC<WorkingAreaFilterProps> = memo(
//   ({ onSelect, defaultLabel = "All Working Areas", defaultValue="",   className = "" }) => {
//     const [areas, setAreas] = useState<WorkingArea[]>([]);
//     const [selectedId, setSelectedId] = useState<string>("");

//     // fetch areas once
//     useEffect(() => {
//       const fetchAreas = async () => {
//         try {
//           const res = await api.get("/coes/working-area");
//           setAreas(res.data);
//         } catch (error) {
//           console.error("Failed to fetch working areas:", error);
//         }
//       };
//       fetchAreas();
//     }, []);

//     // memoized select handler
//     const handleSelect = useCallback(
//       (id: string) => {
//         setSelectedId(id);
//         const area = areas.find((a) => a.id === id) || null;
//         onSelect(area);
//       },
//       [areas, onSelect]
//     );

//     return (
//       <div className={`w-full ${className}`}>
//         <select
//           value={selectedId}
//           onChange={(e) => handleSelect(e.target.value)}
//           className="border rounded-lg p-2 w-full text-sm bg-white shadow-sm"
//         >
//           <option value="">{defaultLabel}</option>
//           {areas.map((area) => (
//             <option key={area.id} value={area.id}>
//               {area.name}
//             </option>
//           ))}
//         </select>
//       </div>
//     );
//   }
// );

// WorkingAreaFilter.displayName = "WorkingAreaFilter";

// export default WorkingAreaFilter;
"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import api from "helper/api";

// ✅ WorkingArea type
export interface WorkingArea {
  id: string;
  name: string;
}

interface WorkingAreaFilterProps {
  onSelect: (area: WorkingArea | null) => void;
  defaultLabel?: string;
  defaultValue?: string; // 👈 pass query param value here (like "level6")
  className?: string;
}

// ✅ Memoized component
const WorkingAreaFilter: React.FC<WorkingAreaFilterProps> = memo(
  ({ onSelect, defaultLabel = "All Working Areas", defaultValue = "", className = "" }) => {
    const [areas, setAreas] = useState<WorkingArea[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");

    // ✅ Fetch all areas
    useEffect(() => {
      const fetchAreas = async () => {
        try {
          const res = await api.get("/coes/working-area");
          setAreas(res.data);
        } catch (error) {
          console.error("❌ Failed to fetch working areas:", error);
        }
      };
      fetchAreas();
    }, []);

    // ✅ Once areas are loaded, match and preselect
    useEffect(() => {
      if (areas.length && defaultValue) {
        // normalize for URL decoding (handles +, %20, etc.)
        const decoded = decodeURIComponent(defaultValue).replace(/\+/g, " ").trim();

        const matchedArea = areas.find(
          (a) => a.name.toLowerCase() === decoded.toLowerCase()
        );

        if (matchedArea) {
          setSelectedId(matchedArea.id);
          onSelect(matchedArea);
        }
      }
    }, [areas, defaultValue, onSelect]);

    // ✅ Handle manual select change
    const handleSelect = useCallback(
      (id: string) => {
        setSelectedId(id);
        const area = areas.find((a) => a.id === id) || null;
        onSelect(area);
      },
      [areas, onSelect]
    );

    return (
      <div className={`w-full ${className}`}>
        <select
          value={selectedId}
          onChange={(e) => handleSelect(e.target.value)}
          className="border rounded-lg p-2 w-full text-sm bg-white shadow-sm"
        >
          <option value="">{defaultLabel}</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

WorkingAreaFilter.displayName = "WorkingAreaFilter";

export default WorkingAreaFilter;
