// "use client";
// import { roleUrlMap } from "helper/assetPath";
// import { useRouter } from "next/navigation";


// import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// type AuthContextType = {
//   user: any;
//   token: string | null;
//   activeRole: string | null;
//   setAuth: (user: any, token: string | null) => void;
//   switchRole: (role: string) => void;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | null>(null);

// export function AuthProvider({
//   children,
//   user,
//   token,
//   initialRole, // 👈 layout.tsx se roleFromUrl aayega
// }: {
//   children: ReactNode;
//   user: any;
//   token: string | undefined;
//   initialRole?: string;
// }) {
//   const [authUser, setAuthUser] = useState<any>(user || null);
//   const [authToken, setAuthToken] = useState<string | null>(token || null);

//   // 👇 activeRole logic
//   const [activeRole, setActiveRole] = useState<string | null>(null);

//   useEffect(() => {
//     if (authUser) {
//       // agar URL se role valid hai use karo, otherwise default [0]
//       const validRoles = authUser.roles || [];
//       const defaultRole =
//         initialRole && validRoles.some((r: string) => r.toLowerCase() === initialRole.toLowerCase())
//           ? initialRole
//           : validRoles[0] || null;

//       setActiveRole(defaultRole);
//     }
//   }, [authUser, initialRole]);

//   // persist token + user
//   useEffect(() => {
//     if (authToken) {
//       localStorage.setItem("accessToken", authToken);
//     } else {
//       localStorage.removeItem("accessToken");
//     }

//     if (authUser) {
//       localStorage.setItem("user", JSON.stringify(authUser));
//     } else {
//       localStorage.removeItem("user");
//     }
//   }, [authToken, authUser]);

//   const setAuth = (newUser: any, newToken: string | null) => {
//     setAuthUser(newUser);
//     setAuthToken(newToken);
//   };
// const router = useRouter();
//   const switchRole = (role: string) => {
//   if (authUser?.roles?.includes(role)) {
//     setActiveRole(role);
//     localStorage.setItem("activeRole", role);

//     // ✅ Navigate based on role mapping
//     const urlSegment = roleUrlMap[role];
//     if (urlSegment) {
//       router.push(`/${urlSegment}/Dashboard`);
//     } 
//   }
// };
//   const logout = () => {
//     setAuthUser(null);
//     setAuthToken(null);
//     setActiveRole(null);
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user: authUser, token: authToken, activeRole, setAuth, switchRole, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };
"use client";
import { roleUrlMap } from "helper/assetPath";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthContextType = {
  user: any;
  token: string | null;
  activeRole: string | null;
  setAuth: (user: any, token: string | null) => void;
  switchRole: (role: string) => void;
  logout: () => void;
  orgLogo?: string | null; // ✅ add this
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  user,
  token,
  initialRole,
}: {
  children: ReactNode;
  user: any;
  token: string | undefined;
  initialRole?: string;
}) {
  const [authUser, setAuthUser] = useState<any>(user || null);
  const [authToken, setAuthToken] = useState<string | null>(token || null);
  const [activeRole, setActiveRole] = useState<string | null>(null);

const [orgLogo, setOrgLogo] = useState<string | null>(user?.orgLogo || null);
  const router = useRouter();

  // ✅ Sync role safely (avoid hydration mismatch)
  useEffect(() => {
    if (authUser) {
      const validRoles = authUser.roles || [];

      // server-side role > localStorage role > first available role
      const storedRole = localStorage.getItem("activeRole");

      let finalRole: string | null = null;

      if (
        initialRole &&
        validRoles.some((r: string) => r.toLowerCase() === initialRole.toLowerCase())
      ) {
        finalRole = initialRole;
      } else if (
        storedRole &&
        validRoles.some((r: string) => r.toLowerCase() === storedRole.toLowerCase())
      ) {
        finalRole = storedRole;
      } else {
        finalRole = validRoles[0] || null;
      }

      setActiveRole(finalRole);

      if (finalRole) {
        localStorage.setItem("activeRole", finalRole);
        document.cookie = `activeRole=${finalRole}; path=/; SameSite=Lax`;
      }
    }
  }, [authUser, initialRole]);

  // ✅ persist token + user
  useEffect(() => {
    if (authToken) {
      localStorage.setItem("accessToken", authToken);
    } else {
      localStorage.removeItem("accessToken");
    }

    if (authUser) {
      localStorage.setItem("user", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("user");
    }
     if (authUser?.orgLogo) {
    setOrgLogo(authUser.orgLogo);
  }
  }, [authToken, authUser]);

 useEffect(() => {
  if (user?.firstlogin && user.roles.includes("COE_MANAGER")) {
    router.push("/coemanager/Dashboard/setup-areas");
  }
}, [user]);

  const setAuth = (newUser: any, newToken: string | null) => {
    setAuthUser(newUser);
    setAuthToken(newToken);
  };

  const switchRole = (role: string) => {
    if (authUser?.roles?.includes(role)) {
      setActiveRole(role);
      localStorage.setItem("activeRole", role);
      document.cookie = `activeRole=${role}; path=/; SameSite=Lax`; // ✅ cookie update

      const urlSegment = roleUrlMap[role];
      if (urlSegment) {
        router.push(`/${urlSegment}/Dashboard`);
      }
    }
  };

  const logout = () => {
    setAuthUser(null);
    setAuthToken(null);
    setActiveRole(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("activeRole");
    document.cookie =
      "activeRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
        token: authToken,
        activeRole,
        setAuth,
        switchRole,
        orgLogo, 
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
