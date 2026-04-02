
// middleware.ts in dashboard repo
  // import { NextResponse } from "next/server";
  // import type { NextRequest } from "next/server";

  // export async function middleware(req: NextRequest) {
  //   const accessToken = req.cookies.get("accessToken")?.value;
  //   const activeRole = req.cookies.get("activeRole")?.value;

  //   // Just check if cookies exist — no backend call needed
  //   if (!accessToken || !activeRole) {
  //     return NextResponse.redirect("https://adresnetwork.iitr.ac.in/login");
  //   }

  //   return NextResponse.next();
  // }

  // export const config = {
  //   matcher: ["/superadmin/:path*", "/coemanager/:path*", "/researcher/:path*"],
  // };

  // middleware.ts (dashboard app root)
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_INTERNAL_URL || "http://localhost:3010";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://adresnetwork.iitr.ac.in";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("rt")?.value;
  const activeRole  = req.cookies.get("activeRole")?.value;

  // ── 1. Has access token? Validate it ─────────────────────────────────────
  if (accessToken) {
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (meRes.ok) {
      const me = await meRes.json();

      // No role chosen → send to choose-role
      if (!activeRole || !me.roles?.includes(activeRole)) {
        return NextResponse.redirect(`${APP_URL}/choose-role`);
      }
      return NextResponse.next();
    }
    // Token invalid/expired — fall through to refresh
  }

  // ── 2. No/expired access token — try silent refresh ──────────────────────
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `rt=${refreshToken}` },
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const response = NextResponse.next();

        // Forward set-cookie from backend
        const setCookieHeader = refreshRes.headers.get("set-cookie");
        if (setCookieHeader) {
          response.headers.set("set-cookie", setCookieHeader);
        }
        if (data.accessToken) {
          response.cookies.set("accessToken", data.accessToken, {
            httpOnly: false,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 60,
            path: "/",
          });
        }

        // If no role → send to choose-role on main app
        if (!activeRole) {
          return NextResponse.redirect(`${APP_URL}/choose-role`);
        }
        return response; // ✅ continue to dashboard
      }
    } catch {}
  }

  // ── 3. Both tokens dead → login ───────────────────────────────────────────
  return NextResponse.redirect(`${APP_URL}/login`);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};
// ```

// ---

// ## 🗺️ How the fixed flow works
// ```
// User reopens browser (rt valid, accessToken expired)
//          │
//          ▼
// Dashboard middleware runs (server-side)
//          │ no accessToken
//          ▼
// Calls /auth/refresh with rt cookie
//          │ success → new accessToken set in cookie
//          ▼
// activeRole cookie exists?
//   YES → continue to dashboard ✅ (no flickering)
//   NO  → redirect to /choose-role
//          │
//          ▼ (choose-role page)
// Middleware on main frontend refreshes token the same way
// AuthContext.validateSession finds user
// RedirectIfAuthenticated checks activeRole
//   stored → goes directly to dashboard ✅
//   not stored → shows /choose-role