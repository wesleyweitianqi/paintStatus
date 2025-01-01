import axios from "axios";

const ENV = process.env.REACT_APP_NODE_ENV;
console.log("🚀 ~ ENV:", ENV);
const url = process.env.REACT_APP_API_URL;
console.log("🚀 ~ url:", url);
const host = ENV === "production" ? url : "http://192.168.1.169:8082";
const instance = axios.create({
  baseURL: host,
  timeout: "5000s",
});

// instance.interceptors.request.use(
//   (config) => {
//     if (config.url.indexOf("register") < 0 && config.url.indexOf("login") < 0) {
//       config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// instance.interceptors.response.use((res) => {
//   const { code, message } = res.data;
//   if (message === "authorization failed") {
//     window.location.replace("/login");
//   }
//   return res;
// });
export default instance;
