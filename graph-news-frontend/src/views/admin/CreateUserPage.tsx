import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  User, Mail, Shield, ArrowLeft, Save, Loader2, AlertCircle, Lock, Eye, EyeOff
} from "lucide-react";

import AdminHeader from "../../components/admin/AdminHeader";
import userService from "../../services/user.service";
import Loading from "../../components/Loading";
import GetUserResponse from "../../model/response/user/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";
import CreateUserRequest from "../../model/request/user/CreateUserRequest";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080";

// Custom button component
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  className?: string; 
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; 
}> = ({ children, className = "", variant = "primary", ...props }) => {
  const baseStyles = "font-medium transition-all duration-300 flex items-center justify-center";
  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white",
    outline: "border border-slate-300 dark:border-slate-600 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card component
const Card: React.FC<{
  title?: string;
  className?: string;
  children: React.ReactNode;
  darkMode: boolean;
}> = ({ title, className = "", children, darkMode }) => (
  <div className={`rounded-xl border transition-colors duration-500 overflow-hidden ${
    darkMode 
      ? 'bg-slate-900 border-slate-800 shadow-lg shadow-slate-900/30' 
      : 'bg-white border-slate-200 shadow-lg shadow-slate-200/30'
  } ${className}`}>
    {title && (
      <div className={`px-6 py-4 border-b transition-colors duration-500 ${
        darkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <h3 className={`font-semibold ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" // Default to USER
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false
  });

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  
  // Update the HTML class when theme changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Check admin authorization
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }

    // Check if the current user is an admin
    userService.getMe(token)
      .then((data: GetUserResponse) => {
        if (data.user.role !== "ADMIN") {
          toast.error("You are not authorized to view this page");
          navigate("/user/profile");
          return;
        }

        setCurrentAdmin(data.user);
        setLoading(false);
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message || "Authentication error");
        navigate("/sign-in");
      });
  }, [navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({ ...formData, [name]: value });
    
    // Clear error when typing
    if (name in errors) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    const newErrors = {
      name: formData.name.trim().length < 3,
      email: !validateEmail(formData.email),
      password: !validatePassword(formData.password)
    };
    
    setErrors(newErrors);
    
    if (newErrors.name || newErrors.email || newErrors.password) {
      return;
    }
    
    setSaving(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      setSaving(false);
      navigate("/sign-in");
      return;
    }

    const createRequest: CreateUserRequest = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };
    
    userService.createUserByAdmin(token, createRequest)
      .then(() => {
        toast.success("User created successfully");
        navigate("/admin/dashboard");
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message || "Failed to create user");
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-r from-slate-900 to-indigo-950' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-100'
      }`}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-slate-950 text-white' 
        : 'bg-slate-50 text-slate-800'
    }`}>
      <AdminHeader 
        user={currentAdmin} 
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
        activeTab="users"
      />

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className={`inline-flex items-center transition-colors ${
                darkMode 
                  ? 'text-slate-300 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
          
          <h1 className={`text-2xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>Create New User</h1>
          
          <Card darkMode={darkMode}>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Name field */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors duration-500 ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      } ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="User's full name"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${
                        errors.name
                          ? 'text-red-500' 
                          : darkMode ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                    </div>
                    
                    {errors.name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">Name must be at least 3 characters</p>
                  )}
                </div>
                
                {/* Email field */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors duration-500 ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      } ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="user@example.com"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${
                        errors.email
                          ? 'text-red-500' 
                          : darkMode ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                    </div>
                    
                    {errors.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">Please enter a valid email address</p>
                  )}
                </div>
                
                {/* Password field */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-2.5 rounded-lg border transition-colors duration-500 ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      } ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${
                        errors.password
                          ? 'text-red-500' 
                          : darkMode ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                    </div>
                    
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className={`${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">Password must be at least 8 characters</p>
                  )}
                </div>
                
                {/* Role field */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    User Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors duration-500 appearance-none ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                      required
                    >
                      <option value="USER">USER (Regular User)</option>
                      <option value="ADMIN">ADMIN (Administrator)</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className={`h-5 w-5 ${
                        darkMode ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className={`h-5 w-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className={`mt-1.5 text-xs ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Admins have full access to the system including user management.
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="pt-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                  <Button
                    type="submit"
                    disabled={saving}
                    variant="primary"
                    className="px-5 py-2.5 rounded-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-5 py-2.5 rounded-lg"
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateUserPage;