// helper/server_api.ts
import axios from "axios";

const apiServer = axios.create({
  baseURL: "http://localhost:3010",
   withCredentials: true,
});

// ❌ no interceptors using cookies() here

export default apiServer;
