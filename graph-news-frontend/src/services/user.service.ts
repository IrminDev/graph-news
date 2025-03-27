import axios from "axios";
import GetUserResponse from "../model/response/user/GetUserResponse";
import ErrorResponse from "../model/response/ErrorResponse";
import ListUserResponse from "../model/response/user/ListUserResponse";
import UpdateUserRequest from "../model/request/user/UpdateUserRequest";
import UpdateMe from "../model/request/user/UpdateMe";
import UpdatePassword from "../model/request/user/UpdatePassword";
import CreateUserRequest from "../model/request/user/CreateUserRequest";
import SignUpResponse from "../model/response/user/SignUpResponse";
const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080"; 

async function getMe(token: string): Promise<GetUserResponse> {
    try {
        const response = await axios.get(`${API_URL}/api/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
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
        console.log(error);
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

async function updateUser(request: UpdateUserRequest, id: string, token: string): Promise<GetUserResponse> {
    try {
        const response = await axios.put(`${API_URL}/api/user/${id}`, request, {
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

async function updateMeWithImage(token: string, request: UpdateMe, image: File | null): Promise<GetUserResponse> {
    try {
      const formData = new FormData();
      
      const blob = new Blob([JSON.stringify(request)], { type: 'application/json' });
      formData.append('request', blob);
      
      if (image) {
        formData.append('image', image);
      } else {
        const emptyBlob = new Blob([], { type: 'application/octet-stream' });
        formData.append('image', emptyBlob, 'empty');
      }
      
      const response = await axios.put(`${API_URL}/api/user/update/me`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
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
          message: "An error occurred while updating your profile"
        } as ErrorResponse;
      }
    }
  }

async function updatePassword(token: string, request: UpdatePassword): Promise<GetUserResponse> {
    try {
        const response = await axios.put(`${API_URL}/api/user/update/me/password`, request, {
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
                message: "An error occurred while updating your password"
            } as ErrorResponse;
        }
    }
}

async function createUserByAdmin(token: string, request: CreateUserRequest): Promise<SignUpResponse> {
    try {
      const response = await axios.post(`${API_URL}/api/user/create/user`, request, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
          message: "An error occurred while creating the user"
        } as ErrorResponse;
      }
    }
}

export default {
    getMe,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateMeWithImage,
    updatePassword,
    createUserByAdmin
};