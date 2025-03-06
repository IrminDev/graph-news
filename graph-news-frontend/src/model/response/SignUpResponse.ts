import User from "../User"

interface SignUpResponse {
    token: string,
    user: User,
    message: string
}

export default SignUpResponse;