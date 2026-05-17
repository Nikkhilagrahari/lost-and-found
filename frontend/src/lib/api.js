import axios from "axios";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://lost-and-found-qtcu.onrender.com";

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("iet_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const CATEGORIES = [
  "ID Card",
  "Electronics",
  "Books & Notes",
  "Accessories",
  "Bag/Backpack",
  "Wallet/Cash",
  "Keys",
  "Clothing",
  "Documents",
  "Other",
];

export const LOCATIONS = [
  "Main Gate",
  "Library",
  "Academic Block",
  "Hostel",
  "Cafeteria",
  "Parking Area",
  "Sports Complex",
  "Auditorium",
  "Lab",
  "Classroom",
  "Other",
];