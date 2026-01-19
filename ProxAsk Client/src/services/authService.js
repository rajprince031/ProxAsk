import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/auth"; // change later

export const loginUser = (loginData) => {
  return axios.post(
    `${API_BASE_URL}/login`, 
    loginData, 
    {
        headers: {
          "Content-Type": "application/json",
        },
  });
};
