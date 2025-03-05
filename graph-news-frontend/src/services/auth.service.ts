import axios from "axios";
import LoginResponse from "../model/response/LoginResponse";
import ErrorResponse from "../model/response/ErrorResponse";
import LoginRequest from "../model/request/LoginRequest";
import SignUpRequest from "../model/request/SignUpRequest";
const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080"; 

async function login(request: LoginRequest): Promise<LoginResponse> {
    try {
        const response = await axios.post(`${API_URL}/api/user/login`, {
            email: request.email,
            password: request.password
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as ErrorResponse;
        } else {
            throw {
                message: "An error occurred"
            } as ErrorResponse;
        }
    }
}

async function register(request: SignUpRequest): Promise<LoginResponse> {
    try {
        const response = await axios.post(`${API_URL}/api/user/signup`, {
            email: request.email,
            name: request.name,
            password: request.password
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as ErrorResponse;
        } else {
            throw {
                message: "An error occurred"
            } as ErrorResponse;
        }
    }
}

export default {
    login,
    register
};