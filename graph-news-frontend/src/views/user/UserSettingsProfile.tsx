import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Key, ArrowLeft, Camera, Shield, Save, 
  CheckCircle, AlertCircle, Info, Loader2, UploadCloud, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import userService from "../../services/user.service";
import UserHeader from "../../components/user/UserHeader";
import Loading from "../../components/Loading";
import GetUserResponse from "../../model/response/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";

const UserSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }
    
    userService.getMe(token)
      .then((data: GetUserResponse) => {
        const userData = {
          id: data.user.id || "",
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        setUser(userData);
        setFormData({
          ...formData,
          name: userData.name,
          email: userData.email
        });
        setLoading(false);
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
        navigate("/sign-in");
      });
  }, [navigate]);
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when typing
    if (name in errors) {
      setErrors({ ...errors, [name]: false });
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image is too large. Maximum size is 2MB.");
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast.error("Only image files are allowed.");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name and email
    const newErrors = {
      ...errors,
      name: formData.name.trim().length < 3,
      email: !validateEmail(formData.email)
    };
    
    setErrors(newErrors);
    
    if (newErrors.name || newErrors.email) {
      return;
    }
    
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email
      });
      
      // If there was an avatar upload, it would be processed here
      if (avatarFile) {
        // This is where you'd handle the avatar upload to your backend
        // For now, we'll just acknowledge it in the toast
        toast.success("Profile updated successfully with new avatar!");
      } else {
        toast.success("Profile updated successfully!");
      }
      
      setSaving(false);
    }, 1500);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password fields
    const newErrors = {
      ...errors,
      currentPassword: formData.currentPassword.length < 6,
      newPassword: formData.newPassword.length < 6,
      confirmPassword: formData.newPassword !== formData.confirmPassword
    };
    
    setErrors(newErrors);
    
    if (newErrors.currentPassword || newErrors.newPassword || newErrors.confirmPassword) {
      return;
    }
    
    setChangingPassword(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Password changed successfully!");
      setChangingPassword(false);
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }, 1500);
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
      <UserHeader 
        user={user} 
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
        activeTab="settings" 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
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
          }`}>Account Settings</h1>
          
          <div className="space-y-8">
            {/* Profile Settings */}
            <div className={`rounded-xl border transition-colors duration-500 overflow-hidden ${
              darkMode 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`px-6 py-4 border-b ${
                darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <h2 className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>Profile Information</h2>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="p-6">
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                        darkMode ? 'border-slate-800' : 'border-white'
                      }`}>
                        <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${
                            darkMode ? 'bg-indigo-600' : 'bg-indigo-500'
                          } text-white`}>
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`font-medium text-lg mb-1 ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>Profile Picture</h3>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5">
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
                        placeholder="Your full name"
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
                        placeholder="your.email@example.com"
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

                  
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center ${
                        saving
                          ? 'bg-indigo-500/70 cursor-not-allowed text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Password Settings */}
            <div className={`rounded-xl border transition-colors duration-500 overflow-hidden ${
              darkMode 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`px-6 py-4 border-b ${
                darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <h2 className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>Change Password</h2>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors duration-500 ${
                          darkMode 
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                            : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        } ${errors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="•••••••••••"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className={`h-5 w-5 ${
                          errors.currentPassword
                            ? 'text-red-500' 
                            : darkMode ? 'text-slate-500' : 'text-slate-400'
                        }`} />
                      </div>
                      
                      {errors.currentPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">Password must be at least 6 characters</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors duration-500 ${
                          darkMode 
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                            : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        } ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="•••••••••••"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className={`h-5 w-5 ${
                          errors.newPassword
                            ? 'text-red-500' 
                            : darkMode ? 'text-slate-500' : 'text-slate-400'
                        }`} />
                      </div>
                      
                      {errors.newPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">New password must be at least 6 characters</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors duration-500 ${
                          darkMode 
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                            : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        } ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="•••••••••••"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className={`h-5 w-5 ${
                          errors.confirmPassword
                            ? 'text-red-500' 
                            : darkMode ? 'text-slate-500' : 'text-slate-400'
                        }`} />
                      </div>
                      
                      {errors.confirmPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">Passwords don't match</p>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-lg border flex items-start ${
                    darkMode 
                      ? 'bg-slate-800/50 border-slate-700' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Info className={`h-5 w-5 mr-3 flex-shrink-0 mt-0.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Your password should:
                      </p>
                      <ul className={`text-sm mt-1 space-y-1 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <li className="flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          Be at least 6 characters long
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          Include a mix of letters, numbers and symbols
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          Not be the same as your previous password
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center ${
                        changingPassword
                          ? 'bg-indigo-500/70 cursor-not-allowed text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Account Settings */}
            <div className={`rounded-xl border transition-colors duration-500 overflow-hidden ${
              darkMode 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`px-6 py-4 border-b ${
                darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <h2 className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>Account Settings</h2>
              </div>
              
              <div className="p-6">
                <div className={`p-4 rounded-lg border mb-6 ${
                  darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      user?.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>Account Type</h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Your account has {user?.role === 'ADMIN' ? 'administrator' : 'standard user'} privileges
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className={`flex items-center ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <input
                        type="checkbox"
                        className={`rounded mr-2 border ${
                          darkMode 
                            ? 'bg-slate-800 border-slate-700 text-indigo-500' 
                            : 'bg-white border-slate-300 text-indigo-600'
                        }`}
                        defaultChecked
                      />
                      Email notifications for account activity
                    </label>
                  </div>
                  
                  <div>
                    <label className={`flex items-center ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <input
                        type="checkbox"
                        className={`rounded mr-2 border ${
                          darkMode 
                            ? 'bg-slate-800 border-slate-700 text-indigo-500' 
                            : 'bg-white border-slate-300 text-indigo-600'
                        }`}
                        defaultChecked
                      />
                      Email notifications for news processing
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button
                      type="button"
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                        darkMode 
                          ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                      onClick={() => {
                        toast.info("This would deactivate your account in a real application.");
                      }}
                    >
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserSettingsPage;