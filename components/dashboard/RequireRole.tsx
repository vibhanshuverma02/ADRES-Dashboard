"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "context/Authcontext";
import { usePathname, useRouter } from "next/navigation";
import { roleRoutes } from "config/RoleRoute";

interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
}

export default function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return; // still fetching session

    if (!user) {
      // ❌ No user → go to login on 3002
      window.location.href = "http://localhost:3002/login";
      return;
    }

    // ✅ Get all allowed roles for this route
    const allowedRoles = Object.entries(roleRoutes)
      .filter(([_, routes]) => routes.includes(pathname))
      .map(([role]) => role);

    // ❌ User has no matching role → redirect
    if (!allowedRoles.some((role) => user.roles.includes(role))) {
      window.location.href = "http://localhost:3002/choose-role";
      return;
    }

    // ✅ Everything checks out → render children
    setReady(true);
  }, [user, loading, pathname]);

  // 🚦 Avoid rendering children until auth + role checks are finished
  if (loading || !ready) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
