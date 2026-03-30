// "use client";
// import { Provider } from "react-redux";
// import { AuthProvider, useAuth } from "context/Authcontext";
// import { setAuthStore } from "helper/api";
// import store from "store/store";
// import { useEffect } from "react";

// function AuthSync({ children }: { children: React.ReactNode }) {
//   const { token, setAuth, logout, user } = useAuth();

//   useEffect(() => {
//     // 🚀 Only minimal data needed for axios interceptors
//     setAuthStore({
//       token,
//       setAuth,
//       logout,
//       user,
//     });
//   }, [token, setAuth, logout, user]);

//   return <>{children}</>;
// }

// const ClientWrapper = ({
//   children,
//   user,
//   token,
//   roleFromUrl,
// }: {
//   children: React.ReactNode;
//   user?: any;
//   token?: string;
//   roleFromUrl?: string;
// }) => {
//   console.log(user)
//   return (
//     <Provider store={store}>
//       <AuthProvider user={user} token={token} initialRole={roleFromUrl}>
//         <AuthSync>{children}</AuthSync>
//       </AuthProvider>
//     </Provider>
//   );
// };

// export default ClientWrapper;
"use client";
import { Provider } from "react-redux";
import { AuthProvider, useAuth } from "context/Authcontext";
import { setAuthStore } from "helper/api";
import store from "store/store";
import { useEffect } from "react";

function AuthSync({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout, user } = useAuth();
  useEffect(() => {
    setAuthStore({
      token,
      setAuth,
      logout,
      user,
    });
  }, [token, setAuth, logout, user]);
  return <>{children}</>;
}

const ClientWrapper = ({
  children,
  user,
  token,
  roleFromUrl,
  newAccessToken,
}: {
  children: React.ReactNode;
  user?: any;
  token?: string;
  roleFromUrl?: string;
  newAccessToken?: string | null;  // ✅ new prop
}) => {
  useEffect(() => {
    // ✅ If layout refreshed the token server-side, sync it to cookie + localStorage
    if (newAccessToken) {
      console.log("🔄 Syncing refreshed accessToken to cookie");
      localStorage.setItem("accessToken", newAccessToken);
      document.cookie = `accessToken=${newAccessToken}; path=/; SameSite=Lax; Secure`;
    }
  }, [newAccessToken]);

  return (
    <Provider store={store}>
      <AuthProvider user={user} token={token} initialRole={roleFromUrl}>
        <AuthSync>{children}</AuthSync>
      </AuthProvider>
    </Provider>
  );
};

export default ClientWrapper;