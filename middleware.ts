// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   console.log("🚀 Middleware triggered for:", req.nextUrl.pathname);

//   const accessToken = req.cookies.get("accessToken")?.value;
//   console.log("accesstoken",accessToken)
//   const url = req.nextUrl.clone();

//   // STEP 1: Validate current token
//   if (accessToken) {
//     const me = await fetch("https://adresnetwork.iitr.ac.in/api/auth/me", {
//       headers: { Authorization: `Bearer ${accessToken}` },
//       credentials: "include",
//     });

//     if (me.ok) {
//       const res = NextResponse.next();
//       const setCookie = me.headers.get("set-cookie");
//       if (setCookie) res.headers.set("set-cookie", setCookie);
//       return res;
//     }
//   }

//   // STEP 2: Try refreshing token
//   const refresh = await fetch("https://adresnetwork.iitr.ac.in/api/auth/refresh", {
//     method: "POST",
//     headers: { cookie: req.cookies.toString() },
//   });

//   if (refresh.ok) {
//     console.log("bhai refresh succefulll cookies set krdeta hu")
//     const res = NextResponse.next();
//     const setCookie = refresh.headers.get("set-cookie");
    
//     if (setCookie) res.headers.set("set-cookie", setCookie);
//     return res;
//   }

//  // STEP 3: Redirect to login — fix the URL
// return NextResponse.redirect(new URL("https://adresnetwork.iitr.ac.in/login"));
// }

// export const config = {
//   matcher: ["/superadmin/:path*", "/coemanager/:path*", "/researcher/:path*"],
// };
// middleware.ts in dashboard repo
  import { NextResponse } from "next/server";
  import type { NextRequest } from "next/server";

  export async function middleware(req: NextRequest) {
    const accessToken = req.cookies.get("accessToken")?.value;
    const activeRole = req.cookies.get("activeRole")?.value;

    // Just check if cookies exist — no backend call needed
    if (!accessToken || !activeRole) {
      return NextResponse.redirect("https://adresnetwork.iitr.ac.in/login");
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: ["/superadmin/:path*", "/coemanager/:path*", "/researcher/:path*"],
  };