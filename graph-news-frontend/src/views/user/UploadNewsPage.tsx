import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Link as LinkIcon, AlertCircle, ArrowLeft, 
  Info, Upload, FileText, FileScan, FileCode,
  Paperclip, X, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import userService from "../../services/user.service";
import UserHeader from "../../components/user/UserHeader";
import Loading from "../../components/Loading";
import GetUserResponse from "../../model/response/user/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";

const UploadNewsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [uploadType, setUploadType] = useState<"url" | "text" | "file">("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validUrl, setValidUrl] = useState(true);
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
        setUser({
          id: data.user.id || "",
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        setLoading(false);
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
        navigate("/sign-in");
      });
  }, [navigate]);
  
  const validateUrl = (value: string) => {
    try {
      new URL(value);
      setValidUrl(true);
      return true;
    } catch (e) {
      setValidUrl(false);
      return false;
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (e.target.value) {
      validateUrl(e.target.value);
    } else {
      setValidUrl(true);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Get only the first file
      const selectedFile = e.target.files[0];
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB.");
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Update the replaceFile function to ensure it properly triggers the file dialog
  const replaceFile = () => {
    console.log("Replace file");
    console.log(fileInputRef.current);
    console.log(fileInputRef.current?.files);
    // First ensure we have a file input reference
    if(fileInputRef.current) {
      // Clear the file input value
      fileInputRef.current.value = '';
      // Trigger a click event on the file input
      fileInputRef.current.click();
    }
  };
  
  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileScan className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on upload type
    if (uploadType === "url" && (!url || !validateUrl(url))) {
      toast.error("Please enter a valid URL");
      return;
    } else if (uploadType === "text" && !content) {
      toast.error("Please enter some content");
      return;
    } else if (uploadType === "file" && !file) {
      toast.error("Please upload a file");
      return;
    }
    
    if (!title) {
      toast.error("Please enter a title for your news");
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      toast.success("News uploaded successfully! It's now being processed.");
      navigate("/user/profile");
      setSubmitting(false);
    }, 2000);
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
        activeTab="upload news" 
      />
      
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
          
          <div className={`rounded-xl border transition-colors duration-500 overflow-hidden ${
            darkMode 
              ? 'bg-slate-900 border-slate-800' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className={`p-3 rounded-full transition-colors duration-500 ${
                  darkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'
                }`}>
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              
              <h1 className={`text-2xl font-bold text-center mb-2 ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>Upload News Article</h1>
              <p className={`text-center mb-8 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Share news content for processing and knowledge graph generation
              </p>
              
              <div className={`mb-6 rounded-lg border p-4 flex items-start ${
                darkMode 
                  ? 'bg-indigo-900/20 border-indigo-800' 
                  : 'bg-indigo-50 border-indigo-100'
              }`}>
                <Info className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
                <div>
                  <p className={`text-sm ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Our system will analyze your content, extract entities and relationships, 
                    and generate a knowledge graph. Processing may take a few minutes.
                  </p>
                </div>
              </div>
              
              {/* Upload Type Tabs */}
              <div className="mb-6 border-b pb-1">
                <div className="flex space-x-8">
                  <button 
                    onClick={() => setUploadType("url")}
                    className={`pb-2 transition-colors relative ${
                      uploadType === "url"
                        ? darkMode 
                          ? 'text-indigo-400 border-indigo-400' 
                          : 'text-indigo-600 border-indigo-600'
                        : darkMode
                          ? 'text-slate-400 hover:text-slate-300'
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    URL
                    {uploadType === "url" && (
                      <motion.div 
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          darkMode ? 'bg-indigo-400' : 'bg-indigo-600'
                        }`} 
                      />
                    )}
                  </button>
                  <button 
                    onClick={() => setUploadType("text")}
                    className={`pb-2 transition-colors relative ${
                      uploadType === "text"
                        ? darkMode 
                          ? 'text-indigo-400 border-indigo-400' 
                          : 'text-indigo-600 border-indigo-600'
                        : darkMode
                          ? 'text-slate-400 hover:text-slate-300'
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Text
                    {uploadType === "text" && (
                      <motion.div 
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          darkMode ? 'bg-indigo-400' : 'bg-indigo-600'
                        }`} 
                      />
                    )}
                  </button>
                  <button 
                    onClick={() => setUploadType("file")}
                    className={`pb-2 transition-colors relative ${
                      uploadType === "file"
                        ? darkMode 
                          ? 'text-indigo-400 border-indigo-400' 
                          : 'text-indigo-600 border-indigo-600'
                        : darkMode
                          ? 'text-slate-400 hover:text-slate-300'
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    File
                    {uploadType === "file" && (
                      <motion.div 
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          darkMode ? 'bg-indigo-400' : 'bg-indigo-600'
                        }`} 
                      />
                    )}
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" // Always hide it
                accept=".pdf,.doc,.docx,.txt"
              />
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title - Always visible */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for this news article"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-500 ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                        : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                    required
                  />
                </div>
                
                {/* URL Input */}
                {uploadType === "url" && (
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      News Article URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="https://example.com/news-article"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-500 ${
                          darkMode 
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                            : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        } ${!validUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        required={uploadType === "url"}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className={`h-5 w-5 ${
                          validUrl 
                            ? darkMode ? 'text-slate-500' : 'text-slate-400' 
                            : 'text-red-500'
                        }`} />
                      </div>
                      
                      {!validUrl && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    
                    {!validUrl && (
                      <p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
                    )}
                  </div>
                )}
                
                {/* Text Input */}
                {uploadType === "text" && (
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      News Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste or type the full news article content here"
                      rows={8}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-500 ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                      required={uploadType === "text"}
                    />
                  </div>
                )}
                
                {/* Single File Upload */}
                {uploadType === "file" && (
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Upload File <span className="text-red-500">*</span>
                      </label>
                      
                      {!file ? (
                        // File upload area when no file is selected
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            darkMode 
                              ? 'border-slate-700 hover:border-indigo-500/50 bg-slate-800/30' 
                              : 'border-slate-300 hover:border-indigo-500/50 bg-slate-50'
                          }`}
                        >
                          <Paperclip className={`w-8 h-8 mx-auto mb-2 ${
                            darkMode ? 'text-slate-500' : 'text-slate-400'
                          }`} />
                          <p className={`mb-1 font-medium ${
                            darkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            Click to upload a file
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            PDF, DOCX, or TXT (max 10MB)
                          </p>
                          {/* Remove the input from here */}
                        </div>
                      ) : (
                        // Show selected file details
                        <div>
                          <div className={`flex items-center justify-between p-4 rounded-lg ${
                            darkMode 
                              ? 'bg-slate-800 border border-slate-700' 
                              : 'bg-white border border-slate-200'
                          }`}>
                            <div className="flex items-center">
                              {getFileIcon(file)}
                              <div className="ml-3">
                                <p className={`font-medium ${
                                  darkMode ? 'text-white' : 'text-slate-800'
                                }`}>
                                  {file.name}
                                </p>
                                <p className={`text-xs ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  {file.type || "Unknown type"} • {(file.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={removeFile}
                              className={`p-2 rounded-full transition-colors ${
                                darkMode 
                                  ? 'bg-slate-700 text-slate-300 hover:text-white' 
                                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                              }`}
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={replaceFile}
                            className={`mt-3 text-sm px-4 py-2 rounded transition-colors inline-flex items-center ${
                              darkMode
                                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose a different file
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={submitting || (uploadType === "url" && !validUrl)}
                  className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
                    (submitting || (uploadType === "url" && !validUrl)) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <Clock className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload & Process
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadNewsPage;