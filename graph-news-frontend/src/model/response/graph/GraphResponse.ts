import NewsGraph from "./NewsGraph";

interface GraphResponse {
    message: string;
    graph?: NewsGraph;
}

export default GraphResponse;