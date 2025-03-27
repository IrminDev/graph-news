interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    role: string; // "USER" or "ADMIN"
  }
  
  export default CreateUserRequest;