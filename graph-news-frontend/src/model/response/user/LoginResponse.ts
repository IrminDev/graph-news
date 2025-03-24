import User from "../../User";

interface LoginResponse {
    token: string,
    user: User
}

export default LoginResponse;