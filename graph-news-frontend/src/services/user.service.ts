import axios from "axios";
import GetUserResponse from "../model/response/GetUserResponse";
import ErrorResponse from "../model/response/ErrorResponse";
import ListUserResponse from "../model/response/ListUserResponse";
import UpdateUserRequest from "../model/request/UpdateUserRequest";
const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080"; 

async function getMe(token: string): Promise<GetUserResponse> {
    try {
        const response = await axios.get(`${API_URL}/api/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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

async function getAllUsers(token: string): Promise<ListUserResponse> {
    try {
        const response = await axios.get(`${API_URL}/api/user/all`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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

async function getUserById(token: string, id: string): Promise<GetUserResponse> {
    try {
        const response = await axios.get(`${API_URL}/api/user/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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

async function updateUser(request: UpdateUserRequest, id: Number): Promise<GetUserResponse> {
    try {
        const response = await axios.put(`${API_URL}/api/user/${id}`, request);
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

async function deleteUser(token: string, id: string): Promise<GetUserResponse> {
    try {
        const response = await axios.delete(`${API_URL}/api/user/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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
    getMe
};