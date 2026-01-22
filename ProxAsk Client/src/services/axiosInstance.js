import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* REQUEST INTERCEPTOR → attach token */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log("I am auth Page" , config)
    return config;
  },
  (error) => Promise.reject(error)
);

/* RESPONSE → handle 401 globally */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 🔒 Token expired / invalid
      localStorage.clear();

      // Redirect to login (hard redirect is safest)
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
