import axiosMain from "axios";
// export const baseUrl = "https://young-wind-4552.fly.dev"; //PRODUCTION VERSION
export const baseUrl = "http://127.0.0.1:8000"; //LOCAL VERSION

export const axios = axiosMain.create({
  baseURL: baseUrl,
});

axios.interceptors.request.use(
  function (config) {
    const AuthToken = localStorage.getItem("AuthToken");
    const tokenObj = JSON.parse(AuthToken);
    const token = tokenObj?.token;
    config.headers = {
      ...config.headers,
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
