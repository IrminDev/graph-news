import axios from "axios";
import UploadNewsContent from "../model/request/news/UploadNewsContent";
import UploadNewsURL from "../model/request/news/UploadNewsURL";
import NewsResponse from "../model/response/news/NewsResponse";
import ErrorResponse from "../model/response/ErrorResponse";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080"; 

async function uploadNewsFile(token: string, data: FormData): Promise<NewsResponse> {
    try {
        const response = await axios.post(`${API_URL}/api/news/upload/file`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data as NewsResponse;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as NewsResponse;
        }
        throw {
            message: "An error occurred"
        } as NewsResponse;
    }
}

async function uploadNewsContent(token: string, data: UploadNewsContent): Promise<NewsResponse> {
    try {
        const response = await axios.post(`${API_URL}/api/news/upload/content`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data as NewsResponse;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as NewsResponse;
        }
        throw {
            message: "An error occurred"
        } as NewsResponse;
    }
}

async function uploadNewsURL(token: string, data: UploadNewsURL): Promise<NewsResponse> {
    try {
        const response = await axios.post(`${API_URL}/api/news/upload/url`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data as NewsResponse;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as NewsResponse;
        }
        throw {
            message: "An error occurred"
        } as NewsResponse;
    }
}

async function getNewsById(id: string): Promise<NewsResponse> {
    try {
        const response = await axios.get(`${API_URL}/api/news/${id}`);
        return response.data;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as ErrorResponse;
        }
        throw {
            message: "An error occurred while fetching the news article"
        } as ErrorResponse;
    }
}

async function getUserNews(token: string, userId: string): Promise<any> {
    try {
        const response = await axios.get(`${API_URL}/api/news/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as ErrorResponse;
        }
        throw {
            message: "An error occurred while fetching user news"
        } as ErrorResponse;
    }
}

async function getUserNewsPaged(token: string, userId: string, page: number = 0, size: number = 10): Promise<any> {
    try {
        const response = await axios.get(`${API_URL}/api/news/user/${userId}/paged`, {
            params: { page, size },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as ErrorResponse;
        }
        throw {
            message: "An error occurred while fetching user news"
        } as ErrorResponse;
    }
}

async function deleteNews(token: string, id: string): Promise<any> {
    try {
        const response = await axios.delete(`${API_URL}/api/news/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as ErrorResponse;
        }
        throw {
            message: "An error occurred while deleting the news article"
        } as ErrorResponse;
    }
}

export {
    uploadNewsFile,
    uploadNewsContent,
    uploadNewsURL,
    getNewsById,
    getUserNews,
    getUserNewsPaged,
    deleteNews
};