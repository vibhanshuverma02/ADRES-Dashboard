
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import apiServer from "helper/server_api";

// import Header from "layouts/header/Header";
// import Sidebar from "layouts/Sidebar";
// import ClientWrapper from "components/common/ClientWrapper";

// interface DashboardProps {
//   children: React.ReactNode;
// }

// export const dynamic = "force-dynamic";


// export default async function DashboardLayout({ children }: DashboardProps) {
//   try {
//     const cookieStore = cookies();
//     const token = (await cookieStore).get("accessToken")?.value;
//     const activeRole = (await cookieStore).get("activeRole")?.value;

//     if (!token) redirect("https://13.203.206.32/login");

//     // --- Step 1: Basic auth info ---
//     const res = await fetch("https://13.203.206.32/api/auth/me", {
//       headers: { Authorization: `Bearer ${token}` },
//       credentials: "include",
//     });
//     if (!res.ok) redirect("https://13.203.206.32/login");

//     const me = await res.json();

//     if (!activeRole || !me.roles?.includes(activeRole)) {
//       redirect("https://13.203.206.32/choose-role");
//     }

//     // --- Step 2: Role-specific profile to get logo etc. ---
//     let profile = null;
//     if (activeRole === "COE_MANAGER") {
//       const coeRes = await fetch("https://13.203.206.32/api/coes/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       profile = coeRes.ok ? await coeRes.json() : null;
//     } else if (activeRole === "SUPER_ADMIN") {
//       const adminRes = await fetch("https://13.203.206.32/api/admin/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       profile = adminRes.ok ? await adminRes.json() : null;
//     } else if (activeRole === "RESEARCHER") {
//       const researcherRes = await fetch(
//         `https://13.203.206.32/api/users/profile/${me.sub}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       profile = researcherRes.ok ? await researcherRes.json() : null;
//     }

//     // --- Step 3: Merge logo into user object ---
//     const orgLogo =
//       profile?.base?.coeManaged?.organization?.logo ||
//       profile?.base?.organization?.logo ||
//       null;

//     const mergedUser = { ...me, orgLogo }; // ✅ pass to client

//     return (
//       <ClientWrapper user={mergedUser} token={token} roleFromUrl={activeRole}>
//         <div>
//           <div className="d-none d-lg-block">
//             <Sidebar hideLogo={false} containerId="miniSidebar" />
//           </div>

//           <div id="content" className="position-relative h-100">
//             <Header />
//             <div className="custom-container">{children}</div>
            
//           </div>
//         </div>
//       </ClientWrapper>
//     );
//   } catch (err) {
//     console.error("❌ Dashboard access failed", err);
//     redirect("https://13.203.206.32/login");
//   }
// }
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "layouts/header/Header";
import Sidebar from "layouts/Sidebar";
import ClientWrapper from "components/common/ClientWrapper";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://13.203.206.32/api";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://13.203.206.32";

interface DashboardProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: DashboardProps) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("accessToken")?.value;
    const activeRole = (await cookieStore).get("activeRole")?.value;

    // Step 1 — No token → redirect to login
    if (!token) redirect(`${APP_URL}/login`);

    // Step 2 — Validate token with backend
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) redirect(`${APP_URL}/login`);

    const me = await res.json();

    // Step 3 — Check active role
    if (!activeRole || !me.roles?.includes(activeRole)) {
      redirect(`${APP_URL}/choose-role`);
    }

    // Step 4 — Role-specific profile
    let profile = null;

    if (activeRole === "COE_MANAGER") {
      const coeRes = await fetch(`${API_URL}/coes/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      profile = coeRes.ok ? await coeRes.json() : null;

    } else if (activeRole === "SUPER_ADMIN") {
      const adminRes = await fetch(`${API_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      profile = adminRes.ok ? await adminRes.json() : null;

    } else if (activeRole === "RESEARCHER") {
      const researcherRes = await fetch(`${API_URL}/users/profile/${me.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      profile = researcherRes.ok ? await researcherRes.json() : null;
    }

    // Step 5 — Merge logo
    const orgLogo =
      profile?.base?.coeManaged?.organization?.logo ||
      profile?.base?.organization?.logo ||
      null;

    const mergedUser = { ...me, orgLogo };

    return (
      <ClientWrapper user={mergedUser} token={token} roleFromUrl={activeRole}>
        <div>
          <div className="d-none d-lg-block">
            <Sidebar hideLogo={false} containerId="miniSidebar" />
          </div>
          <div id="content" className="position-relative h-100">
            <Header />
            <div className="custom-container">{children}</div>
          </div>
        </div>
      </ClientWrapper>
    );

  } catch (err) {
    console.error("❌ Dashboard access failed", err);
    redirect(`${process.env.NEXT_PUBLIC_APP_URL || "https://13.203.206.32"}/login`);
  }
}
