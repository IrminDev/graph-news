import React, { useState } from "react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import ErrorResponse from "../model/response/ErrorResponse";
import LoginResponse from "../model/response/LoginResponse";
import LoginRequest from "../model/request/LoginRequest";
import { toast } from "react-toastify";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    authService.login({ email, password } as LoginRequest)
      .then((response: LoginResponse) => {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/user/me");
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
      <div className="bg-white text-black p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <Input onChange={handleEmailChange} value={email} type="email" placeholder="Email" className="px-4 py-2 border rounded-lg" />
          <Input onChange={handlePasswordChange} value={password} type="password" placeholder="Password" className="px-4 py-2 border rounded-lg" />
          <Button className="bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-lg">Sign In</Button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <Link to="/sign-up" className="text-blue-700">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
