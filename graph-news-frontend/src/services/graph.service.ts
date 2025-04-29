import axios from "axios";
import GraphResponse from "../model/response/graph/GraphResponse";
import ErrorResponse from "../model/response/ErrorResponse";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080";

async function getNewsGraph(newsId: string): Promise<GraphResponse> {
    try {
        const response = await axios.get(`${API_URL}/api/graph/news/${newsId}`);
        return response.data as GraphResponse;
    } catch (error) {
        if(axios.isAxiosError(error) && error.response) {
            throw {
                message: error.response.data.message
            } as ErrorResponse;
        }
        throw {
            message: "An error occurred while fetching the graph data"
        } as ErrorResponse;
    }
}

export {
    getNewsGraph
};