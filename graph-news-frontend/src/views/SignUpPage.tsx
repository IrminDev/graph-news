import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Network, Check, AlertCircle, User, Mail, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/auth.service";
import SignUpRequest from "../model/request/user/SignUpRequest";
import LoginResponse from "../model/response/user/LoginResponse";
import ErrorResponse from "../model/response/ErrorResponse";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validations, setValidations] = useState({
    name: true,
    email: true,
    password: true
  });
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  
  // Update the HTML class when component mounts
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setValidations({...validations, name: e.target.value.length >= 3});
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValidations({...validations, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)});
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setValidations({...validations, password: e.target.value.length >= 6});
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValid = name.length >= 3;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;
    
    setValidations({
      name: nameValid,
      email: emailValid,
      password: passwordValid
    });
    
    if (nameValid && emailValid && passwordValid) {
      setLoading(true);
      
      authService.register({ name, email, password } as SignUpRequest)
        .then((response: LoginResponse) => {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          
          toast.success("Account created successfully!");
          navigate("/user/me");
        })
        .catch((error: ErrorResponse) => {
          toast.error(error.message || "Failed to create account. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-r from-slate-900 to-indigo-950' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-100'
    }`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <Link to="/" className={`inline-flex items-center transition-colors ${
            darkMode 
              ? 'text-indigo-400 hover:text-indigo-300' 
              : 'text-indigo-600 hover:text-indigo-800'
          }`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div className={`backdrop-blur-sm border rounded-xl shadow-xl overflow-hidden transition-colors duration-500 ${
          darkMode 
            ? 'bg-slate-800/60 border-slate-700' 
            : 'bg-white/90 border-slate-200'
        }`}>
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className={`p-3 rounded-full transition-colors duration-500 ${
                darkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'
              }`}>
                <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            
            <h2 className={`text-3xl font-bold text-center mb-2 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>Join GraphNova</h2>
            <p className={`text-center mb-8 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>Create your account to explore knowledge graphs</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className={`w-full border rounded-lg pl-12 pr-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      darkMode 
                        ? 'bg-slate-900/70 border-slate-600 focus:border-indigo-500 text-white' 
                        : 'bg-white border-slate-300 focus:border-indigo-500 text-slate-800'
                    } ${!validations.name ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  {!validations.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {!validations.name && (
                  <p className="text-sm text-red-500 mt-1">Name must be at least 3 characters</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full border rounded-lg pl-12 pr-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      darkMode 
                        ? 'bg-slate-900/70 border-slate-600 focus:border-indigo-500 text-white' 
                        : 'bg-white border-slate-300 focus:border-indigo-500 text-slate-800'
                    } ${!validations.email ? 'border-red-500' : ''}`}
                    placeholder="example@email.com"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  {!validations.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {!validations.email && (
                  <p className="text-sm text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full border rounded-lg pl-12 pr-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      darkMode 
                        ? 'bg-slate-900/70 border-slate-600 focus:border-indigo-500 text-white' 
                        : 'bg-white border-slate-300 focus:border-indigo-500 text-slate-800'
                    } ${!validations.password ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  {!validations.password && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {!validations.password && (
                  <p className="text-sm text-red-500 mt-1">Password must be at least 6 characters</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
          
          <div className={`py-4 px-8 border-t transition-colors duration-500 ${
            darkMode 
              ? 'bg-slate-900/80 border-slate-700' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <p className={`text-center ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Already have an account?{' '}
              <Link to="/sign-in" className={`font-medium ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
              }`}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        <p className={`text-center text-sm mt-8 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          By creating an account, you agree to our{' '}
          <a href="#" className={`${
            darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
          }`}>Terms of Service</a>{' '}
          and{' '}
          <a href="#" className={`${
            darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
          }`}>Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;