import axios from "axios";

// const baseUrl = import.meta.env.VITE_ENV === 'production' 
// ? "https://expo-app-3.onrender.com/api" 
// : "http://localhost:4000/api";

const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_SERVER_URL,
    withCredentials:true, // send the cookies by browser to server with request automatically
});

export default axiosInstance;