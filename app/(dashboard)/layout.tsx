
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

//     if (!token) redirect("https://adresnetwork.iitr.ac.in/login");

//     // --- Step 1: Basic auth info ---
//     const res = await fetch("https://adresnetwork.iitr.ac.in/api/auth/me", {
//       headers: { Authorization: `Bearer ${token}` },
//       credentials: "include",
//     });
//     if (!res.ok) redirect("https://adresnetwork.iitr.ac.in/login");

//     const me = await res.json();

//     if (!activeRole || !me.roles?.includes(activeRole)) {
//       redirect("https://adresnetwork.iitr.ac.in/choose-role");
//     }

//     // --- Step 2: Role-specific profile to get logo etc. ---
//     let profile = null;
//     if (activeRole === "COE_MANAGER") {
//       const coeRes = await fetch("https://adresnetwork.iitr.ac.in/api/coes/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       profile = coeRes.ok ? await coeRes.json() : null;
//     } else if (activeRole === "SUPER_ADMIN") {
//       const adminRes = await fetch("https://adresnetwork.iitr.ac.in/api/admin/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       profile = adminRes.ok ? await adminRes.json() : null;
//     } else if (activeRole === "RESEARCHER") {
//       const researcherRes = await fetch(
//         `https://adresnetwork.iitr.ac.in/api/users/profile/${me.sub}`,
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
//     redirect("https://adresnetwork.iitr.ac.in/login");
//   }
// }
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "layouts/header/Header";
import Sidebar from "layouts/Sidebar";
import ClientWrapper from "components/common/ClientWrapper";

// ✅ Internal URL — no SSL issues between containers
const API_URL = process.env.API_INTERNAL_URL || "http://localhost:3010";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://adresnetwork.iitr.ac.in";

interface DashboardProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: DashboardProps) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("accessToken")?.value;
    const activeRole = (await cookieStore).get("activeRole")?.value;

    if (!token) redirect(`${APP_URL}/login`);

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) redirect(`${APP_URL}/login`);
    const me = await res.json();

    // ✅ DEBUG 1 — me object
    console.log('🔍 [LAYOUT] me object:', {
      sub: me.sub,
      roles: me.roles,
      orgId: me.orgId,
      orgLogo: me.orgLogo,   // expect null here — that's fine
    });

    if (!activeRole || !me.roles?.includes(activeRole)) {
      redirect(`${APP_URL}/choose-role`);
    }

    let profile = null;
    let profileRes: Response | null = null;

    if (activeRole === "COE_MANAGER") {
      profileRes = await fetch(`${API_URL}/coes/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } else if (activeRole === "SUPER_ADMIN") {
      profileRes = await fetch(`${API_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } else if (activeRole === "RESEARCHER") {
      profileRes = await fetch(`${API_URL}/users/profile/${me.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    }

    // ✅ DEBUG 2 — Raw profile response
    if (profileRes) {
      console.log('🔍 [LAYOUT] profile fetch status:', profileRes.status, profileRes.ok);
      if (profileRes.ok) {
        profile = await profileRes.json();
        console.log('🔍 [LAYOUT] profile response:', JSON.stringify({
          keys: Object.keys(profile || {}),
          orgLogo: profile?.orgLogo,                                        // ← THE KEY ONE
          baseCoeOrgLogo: profile?.base?.coeManaged?.organization?.logo,
          baseResearcherOrgLogo: profile?.base?.researcherProfile?.organization?.logo,
        }, null, 2));
      } else {
        console.log('🔍 [LAYOUT] profile fetch failed');
      }
    }

    // ✅ DEBUG 3 — orgLogo resolution chain
    const orgLogoSources = {
      'profile?.orgLogo':                                   profile?.orgLogo,
      'profile?.base?.coeManaged?.organization?.logo':      profile?.base?.coeManaged?.organization?.logo,
      'profile?.base?.researcherProfile?.organization?.logo': profile?.base?.researcherProfile?.organization?.logo,
      'me?.orgLogo':                                        me?.orgLogo,
    };
    console.log('🔍 [LAYOUT] orgLogo sources:', orgLogoSources);

    const orgLogo =
      profile?.orgLogo ||
      profile?.base?.coeManaged?.organization?.logo ||
      profile?.base?.researcherProfile?.organization?.logo ||
      me?.orgLogo ||
      null;

    console.log('🔍 [LAYOUT] ✅ Final orgLogo:', orgLogo);

    const mergedUser = { ...me, orgLogo };
    console.log('🔍 [LAYOUT] mergedUser.orgLogo:', mergedUser.orgLogo); // last check before passing to client

    return (
      <ClientWrapper user={mergedUser} token={token} roleFromUrl={activeRole}>
        ...
      </ClientWrapper>
    );

  } catch (err) {
    console.error("❌ Dashboard access failed", err);
    redirect(`${APP_URL}/login`);
  }
}
