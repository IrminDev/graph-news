import User from "./User";

interface News {
    id: number,
    title: string,
    url: string,
    author: User
}

export default News;