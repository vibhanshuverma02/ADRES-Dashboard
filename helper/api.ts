// "use client";
// import axios from "axios";

// type AuthStore = {
//   token: string | null;
//   setAuth?: (user: any, token: string | null) => void;
//   logout?: () => void;
//   user?: any;
// };

// let store: AuthStore = { token: null };

// // 👇 AuthContext se set hoga
// export const setAuthStore = (auth: AuthStore) => {
//   store = auth;
// };

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010",
//   withCredentials: true,
// });

// // ✅ Request interceptor → always attach latest token
// api.interceptors.request.use(
//   (config) => {
//     const token = store?.token || localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (err) => Promise.reject(err)
// );

// // ✅ Refresh logic
// let isRefreshing = false;
// let failedQueue: any[] = [];

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = "Bearer " + token;
//             return api(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const res = await axios.post(
//           `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
//           {},
//           { withCredentials: true }
//         );

//         const newToken = res.data?.accessToken;
//         if (newToken) {
//           // 🔑 update AuthContext + localStorage
//           store?.setAuth?.(store.user, newToken);
//           localStorage.setItem("accessToken", newToken);

//           processQueue(null, newToken);

//           originalRequest.headers.Authorization = "Bearer " + newToken;
//           return api(originalRequest);
//         }
//       } catch (err) {
//         processQueue(err, null);
//         store?.logout?.(); // logout user
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
"use client";
import axios from "axios";

type AuthStore = {
  token: string | null;
  setAuth?: (user: any, token: string | null) => void;
  logout?: () => void;
  user?: any;
};

let store: AuthStore = { token: null };
export const setAuthStore = (auth: AuthStore) => (store = auth);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010",
  withCredentials: true,
});

// ⬆️ Always attach access token
api.interceptors.request.use(
  (config) => {
    const token = store.token || localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// 🔁 Refresh Logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);

    if (isRefreshing)
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));

    original._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true });
const newToken = res.data?.accessToken;
if (newToken) {
  store.setAuth?.(store.user, newToken);
  localStorage.setItem("accessToken", newToken);
  // ✅ Add this
  document.cookie = `accessToken=${newToken}; path=/; SameSite=Lax; Secure`;
  processQueue(null, newToken);
  original.headers.Authorization = `Bearer ${newToken}`;
  return api(original);
}
    } catch (err) {
      processQueue(err, null);
      store.logout?.();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
