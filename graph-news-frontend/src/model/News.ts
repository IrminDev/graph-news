import User from "./User";

interface News {
    id: number;
    title: string;
    content: string;
    author: User;
    createdAt?: string;
}

export default News;