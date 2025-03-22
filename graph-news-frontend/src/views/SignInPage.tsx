import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Network, LogIn, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/auth.service";
import LoginRequest from "../model/request/LoginRequest";
import LoginResponse from "../model/response/LoginResponse";
import ErrorResponse from "../model/response/ErrorResponse";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    authService.login({ email, password } as LoginRequest)
      .then((response: LoginResponse) => {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        toast.success("Welcome back!");
        navigate("/user/profile");
      })
      .catch((error: ErrorResponse) => {
        setError(error.message || "Invalid email or password");
        toast.error(error.message || "Sign in failed. Please check your credentials.");
      })
      .finally(() => {
        setLoading(false);
      });
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
            }`}>Welcome Back</h2>
            <p className={`text-center mb-8 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>Sign in to continue exploring knowledge graphs</p>
            
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    }`}
                    placeholder="example@email.com"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>Password</label>
                  <a href="#" className={`text-xs ${
                    darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                  }`}>Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full border rounded-lg pl-12 pr-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      darkMode 
                        ? 'bg-slate-900/70 border-slate-600 focus:border-indigo-500 text-white' 
                        : 'bg-white border-slate-300 focus:border-indigo-500 text-slate-800'
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 ${
                    darkMode ? 'border-slate-600 bg-slate-900/70' : 'border-slate-300 bg-white'
                  }`}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Remember me for 30 days
                </label>
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
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Signing in...' : 'Sign In'}
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
              Don't have an account?{' '}
              <Link to="/sign-up" className={`font-medium ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
              }`}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
        
      </motion.div>
    </div>
  );
};

export default SignInPage;