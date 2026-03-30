"use client";
import { Provider } from "react-redux";
import { AuthProvider, useAuth } from "context/Authcontext";
import { setAuthStore } from "helper/api";
import store from "store/store";
import { useEffect } from "react";

function AuthSync({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout, user } = useAuth();

  useEffect(() => {
    // 🚀 Only minimal data needed for axios interceptors
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
}: {
  children: React.ReactNode;
  user?: any;
  token?: string;
  roleFromUrl?: string;
}) => {
  console.log(user)
  return (
    <Provider store={store}>
      <AuthProvider user={user} token={token} initialRole={roleFromUrl}>
        <AuthSync>{children}</AuthSync>
      </AuthProvider>
    </Provider>
  );
};

export default ClientWrapper;
