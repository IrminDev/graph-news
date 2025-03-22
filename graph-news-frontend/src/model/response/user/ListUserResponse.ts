import User from "../User";

interface ListUserResponse {
    users: User[],
    message: string
}

export default ListUserResponse;