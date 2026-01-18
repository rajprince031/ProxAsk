import axios from "axios";

const API_BASE_URL = "http://localhost:8080"; // change later

export const loginUser = (loginData) => {
  return axios.post(`${API_BASE_URL}/auth/login`, loginData);
};
