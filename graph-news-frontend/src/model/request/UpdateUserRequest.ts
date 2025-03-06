interface UpdateUserRequest {
    name: string;
    email: string;
    password: string | null;
    role: string | null;
}

export default UpdateUserRequest;