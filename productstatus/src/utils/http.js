import axios from "axios";

const ENV = process.env.REACT_APP_NODE_ENV;
const url = process.env.REACT_APP_API_URL;
const host = ENV === "production" ? "http://192.168.1.117:8082" : url;
const instance = axios.create({
  baseURL: host,
  timeout: "5000s",
});

export default instance;
