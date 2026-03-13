import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("🚀 Middleware triggered for:", req.nextUrl.pathname);

  const accessToken = req.cookies.get("accessToken")?.value;
  console.log("accesstoken",accessToken)
  const url = req.nextUrl.clone();

  // STEP 1: Validate current token
  if (accessToken) {
    const me = await fetch("https://13.203.206.32/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });

    if (me.ok) {
      const res = NextResponse.next();
      const setCookie = me.headers.get("set-cookie");
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }
  }

  // STEP 2: Try refreshing token
  const refresh = await fetch("https://13.203.206.32/api/auth/refresh", {
    method: "POST",
    headers: { cookie: req.cookies.toString() },
  });

  if (refresh.ok) {
    console.log("bhai refresh succefulll cookies set krdeta hu")
    const res = NextResponse.next();
    const setCookie = refresh.headers.get("set-cookie");
    
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  }

 // STEP 3: Redirect to login — fix the URL
return NextResponse.redirect(new URL("https://13.203.206.32/login"));
}

export const config = {
  matcher: ["/superadmin/:path*", "/coemanager/:path*", "/researcher/:path*"],
};

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   console.log("🚀 Middleware triggered for:", req.nextUrl.pathname);

//   let accessToken = req.cookies.get("accessToken")?.value;

//   if (accessToken) {
//     console.log("middleware mein");

//     const meRes = await fetch("https://13.203.206.32/api/auth/me", {
//       headers: { Authorization: `Bearer ${accessToken}` },
//       credentials: "include", // 👈 forward cookies
//     });

//     if (meRes.ok) {
//       // ✅ Token valid → check if backend returned fresh cookie
//       const res = NextResponse.next();

//       const setCookie = meRes.headers.get("set-cookie");
//       if (setCookie) {
//         // forward updated accessToken cookie
//         res.headers.set("set-cookie", setCookie);
//       }

//       return res;
//     }

//     console.log("⚠️ accessToken invalid → trying refresh...");
//   }

//   // ✅ Step 2: try refresh
//   const refreshRes = await fetch("https://13.203.206.32/api/auth/refresh", {
//     method: "POST",
//     headers: { cookie: req.cookies.toString() }, // forward RT
//   });

//   if (!refreshRes.ok) {
//     console.log("❌ Refresh failed → redirect to login");
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // ✅ Step 3: set new cookies in response
//   const res = NextResponse.next();
//   const setCookie = refreshRes.headers.get("set-cookie");
//   if (setCookie) {
//     res.headers.set("set-cookie", setCookie);
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/superadmin/:path*", "/coemanager/:path* ",     "/researcher/:path*",  ],
// };
