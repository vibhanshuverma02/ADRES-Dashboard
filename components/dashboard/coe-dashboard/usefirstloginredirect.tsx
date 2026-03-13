"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/helper/api"; // your axios instance

export default function useFirstLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkFirstLogin = async () => {
      try {
        const res = await api.get("/coe/profile/me");
        const profile = res.data?.data;
        
        // redirect if setup not done
        if (!profile?.hasSetupAreas) {
          router.push("/dashboard/setup-areas");
        }
      } catch (err) {
        console.error("Error checking CoE profile:", err);
      }
    };

    checkFirstLogin();
  }, [router]);
}
