
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import Header from "layouts/header/Header";
// import Sidebar from "layouts/Sidebar";
// import ClientWrapper from "components/common/ClientWrapper";

// // ✅ Internal URL — no SSL issues between containers
// const API_URL = process.env.API_INTERNAL_URL || "http://localhost:3010";
// const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://adresnetwork.iitr.ac.in";

// interface DashboardProps {
//   children: React.ReactNode;
// }

// export const dynamic = "force-dynamic";

// export default async function DashboardLayout({ children }: DashboardProps) {
//   try {
//     const cookieStore = cookies();
//     const token = (await cookieStore).get("accessToken")?.value;
//     const activeRole = (await cookieStore).get("activeRole")?.value;

//     if (!token) redirect(`${APP_URL}/login`);

//     // ✅ Internal fetch — no SSL cert issue
//     const res = await fetch(`${API_URL}/auth/me`, {
//       headers: { Authorization: `Bearer ${token}` },
//       cache: "no-store",
//     });

//     if (!res.ok) redirect(`${APP_URL}/login`);
//     const me = await res.json();

//     if (!activeRole || !me.roles?.includes(activeRole)) {
//       redirect(`${APP_URL}/choose-role`);
//     }

//     let profile = null;
//     if (activeRole === "COE_MANAGER") {
//       const r = await fetch(`${API_URL}/coes/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });
//       profile = r.ok ? await r.json() : null;
//     } else if (activeRole === "SUPER_ADMIN") {
//       const r = await fetch(`${API_URL}/admin/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });
//       profile = r.ok ? await r.json() : null;
//     } else if (activeRole === "RESEARCHER") {
//       const r = await fetch(`${API_URL}/users/profile/${me.sub}`, {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });
//       profile = r.ok ? await r.json() : null;
//     }
//  const orgLogo =
//       profile?.base?.coeManaged?.organization?.logo ||
//       profile?.base?.organization?.logo ||
//       null;

//     const mergedUser = { ...me, orgLogo };

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
//     redirect(`${APP_URL}/login`);
//   }
// }
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "layouts/header/Header";
import Sidebar from "layouts/Sidebar";
import ClientWrapper from "components/common/ClientWrapper";

const API_URL = process.env.API_INTERNAL_URL || "http://localhost:3010";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://adresnetwork.iitr.ac.in";

interface DashboardProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: DashboardProps) {
  try {
    const cookieStore = await cookies();

    let accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("rt")?.value;
    const activeRole = cookieStore.get("activeRole")?.value;

    // ─── Step 1: No tokens at all → login ───────────────────────
    if (!accessToken && !refreshToken) {
      redirect(`${APP_URL}/login`);
    }

    // ─── Step 2: Try /auth/me with current accessToken ───────────
    let me: any = null;
    let newAccessToken: string | null = null;

    if (accessToken) {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        me = await res.json();
      }
    }

    // ─── Step 3: accessToken expired → try refresh ───────────────
    if (!me && refreshToken) {
      console.log("🔄 accessToken expired, trying refresh...");
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: `rt=${refreshToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!refreshRes.ok) {
        console.log("❌ Refresh failed → redirect to login");
        redirect(`${APP_URL}/login`);
      }

      const refreshData = await refreshRes.json();
      newAccessToken = refreshData.accessToken;
      accessToken = newAccessToken!;

      // Validate new token
      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });

      if (!meRes.ok) redirect(`${APP_URL}/login`);
      me = await meRes.json();
    }

    // ─── Step 4: Still no user → login ───────────────────────────
    if (!me) redirect(`${APP_URL}/login`);

    // ─── Step 5: Check active role ────────────────────────────────
    if (!activeRole || !me.roles?.includes(activeRole)) {
      redirect(`${APP_URL}/choose-role`);
    }

    // ─── Step 6: Role-specific profile ───────────────────────────
    let profile = null;
    if (activeRole === "COE_MANAGER") {
      const r = await fetch(`${API_URL}/coes/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      profile = r.ok ? await r.json() : null;
    } else if (activeRole === "SUPER_ADMIN") {
      const r = await fetch(`${API_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      profile = r.ok ? await r.json() : null;
    } else if (activeRole === "RESEARCHER") {
      const r = await fetch(`${API_URL}/users/profile/${me.sub}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      profile = r.ok ? await r.json() : null;
    }

    // ─── Step 7: Merge user + logo ────────────────────────────────
    const orgLogo =
      profile?.base?.coeManaged?.organization?.logo ||
      profile?.base?.organization?.logo ||
      null;

    const mergedUser = { ...me, orgLogo };

    return (
      <ClientWrapper
        user={mergedUser}
        token={accessToken}        // ✅ pass new token if refreshed
        roleFromUrl={activeRole}
        newAccessToken={newAccessToken}  // ✅ tell client to update cookie
      >
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
  } catch (err: any) {
    // Don't catch redirect errors
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    console.error("❌ Dashboard access failed", err);
    redirect(`${APP_URL}/login`);
  }
}