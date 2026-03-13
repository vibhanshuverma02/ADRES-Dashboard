
// // app/(dashboard)/layout.tsx
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

//     if (!token) {
//       redirect("https://13.203.206.32/login");
//     }

//     const me = await apiServer.get("/auth/me", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!me) {
//       console.log("failhua refresh naimila");
//     }

//     if (!me.data.roles?.includes("SUPER_ADMIN")) {
//       redirect("https://13.203.206.32/choose-role");
//     }

//     return (
//       <ClientWrapper user={me.data} token={token}>
//         <div>
//           {/* ✅ Sidebar visible only on desktop */}
//           <div className="d-none d-lg-block">
//             <Sidebar hideLogo={false} containerId="miniSidebar" />
//           </div>

//           <div id="content" className="position-relative h-100">
//             <Header />
//             <div className="custom-container">{children}</div>
//             <div className="custom-container">
//               <span className="me-1">Theme distributed by - </span>
//               <a
//                 href="https://www.themewagon.com/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 ThemeWagon
//               </a>
//             </div>
//           </div>
//         </div>
//       </ClientWrapper>
//     );
//   } catch (err) {
//     console.error("❌ Dashboard access failed", err);
//     redirect("https://13.203.206.32/login");
//   }
// }
// app/(dashboard)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import apiServer from "helper/server_api";

import Header from "layouts/header/Header";
import Sidebar from "layouts/Sidebar";
import ClientWrapper from "components/common/ClientWrapper";

interface DashboardProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

// export default async function DashboardLayout({ children }: DashboardProps) {
//   try {
//     const cookieStore = cookies();
// const token = (await cookieStore).get("accessToken")?.value;
// const activeRole = (await cookieStore).get("activeRole")?.value;

// if (!token) redirect("https://13.203.206.32/login");

// const res = await fetch("https://13.203.206.32/api/auth/me", {
//   headers: { Authorization: `Bearer ${token}` },
//   credentials: "include",
// });

// if (!res.ok) {
//   console.log("❌ /auth/me fail hua", res.status);
//   redirect("https://13.203.206.32/login");
// }

// const me = await res.json();
// console.log(me)

// if (!activeRole || !me.roles?.includes(activeRole)) {
//   redirect("https://13.203.206.32/choose-role");
// }


//     return (
//       <ClientWrapper user={me} token={token} roleFromUrl={activeRole}>
//         <div>
//           <div className="d-none d-lg-block">
//             <Sidebar hideLogo={false} containerId="miniSidebar" />
//           </div>

//           <div id="content" className="position-relative h-100">
//             <Header />
//             <div className="custom-container">{children}</div>
//             <div className="custom-container">
//               <span className="me-1">Theme distributed by - </span>
//               <a
//                 href="https://www.themewagon.com/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 ThemeWagon
//               </a>
//             </div>
//           </div>
//         </div>
//       </ClientWrapper>
//     );
//   } catch (err) {
//     console.error("❌ Dashboard access failed", err);
//     redirect("https://13.203.206.32/login");
//   }
// }
// app/(dashboard)/layout.tsx


export default async function DashboardLayout({ children }: DashboardProps) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("accessToken")?.value;
    const activeRole = (await cookieStore).get("activeRole")?.value;

    if (!token) redirect("https://13.203.206.32/login");

    // --- Step 1: Basic auth info ---
    const res = await fetch("https://13.203.206.32/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (!res.ok) redirect("https://13.203.206.32/login");

    const me = await res.json();

    if (!activeRole || !me.roles?.includes(activeRole)) {
      redirect("https://13.203.206.32/choose-role");
    }

    // --- Step 2: Role-specific profile to get logo etc. ---
    let profile = null;
    if (activeRole === "COE_MANAGER") {
      const coeRes = await fetch("https://13.203.206.32/api/coes/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      profile = coeRes.ok ? await coeRes.json() : null;
    } else if (activeRole === "SUPER_ADMIN") {
      const adminRes = await fetch("https://13.203.206.32/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      profile = adminRes.ok ? await adminRes.json() : null;
    } else if (activeRole === "RESEARCHER") {
      const researcherRes = await fetch(
        `https://13.203.206.32/api/users/profile/${me.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      profile = researcherRes.ok ? await researcherRes.json() : null;
    }

    // --- Step 3: Merge logo into user object ---
    const orgLogo =
      profile?.base?.coeManaged?.organization?.logo ||
      profile?.base?.organization?.logo ||
      null;

    const mergedUser = { ...me, orgLogo }; // ✅ pass to client

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
    redirect("https://13.203.206.32/login");
  }
}
