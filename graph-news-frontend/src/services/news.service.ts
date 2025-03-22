import axios from "axios";
import UploadNewsFile from "../model/request/news/UploadNewsFile";
import UploadNewsPage from "../views/user/UploadNewsPage";
import UploadNewsURL from "../model/request/news/UploadNewsURL";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080"; 

async function uploadNewsFile(token: string, request: UploadNewsFile): Promise<void> {
    try {
        const response = await axios.post(`${API_URL}/api/news/file`, request, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}