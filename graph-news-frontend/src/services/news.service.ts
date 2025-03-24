import axios from "axios";
import UploadNewsContent from "../model/request/news/UploadNewsContent";
import UploadNewsURL from "../model/request/news/UploadNewsURL";
import NewsSubmited from "../model/response/news/NewsSubmited";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080"; 

async function uploadNewsFile(token: string, data: FormData): Promise<NewsSubmited> {
    try {
        const response = await axios.post(`${API_URL}/api/news/upload/file`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data as NewsSubmited;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as NewsSubmited;
        }
        throw {
            message: "An error occurred"
        } as NewsSubmited;
    }
}

async function uploadNewsContent(token: string, data: UploadNewsContent): Promise<NewsSubmited> {
    try {
        const response = await axios.post(`${API_URL}/api/news/upload/content`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data as NewsSubmited;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as NewsSubmited;
        }
        throw {
            message: "An error occurred"
        } as NewsSubmited;
    }
}

async function uploadNewsURL(token: string, data: UploadNewsURL): Promise<NewsSubmited> {
    try {
        const response = await axios.post(`${API_URL}/api/news/upload/url`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data as NewsSubmited;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as NewsSubmited;
        }
        throw {
            message: "An error occurred"
        } as NewsSubmited;
    }
}

export {
    uploadNewsFile,
    uploadNewsContent,
    uploadNewsURL
};