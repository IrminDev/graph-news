import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminHeader from "../../components/admin/AdminHeader";
import { 
  Users, BarChart2, PieChart, TrendingUp, UserX, User as UserIcon, Edit, 
  Search, Trash2, ChevronLeft, ChevronRight, Filter, 
  ArrowUpRight, RefreshCw, Settings, Moon, Sun 
} from "lucide-react";

import userService from "../../services/user.service";
import ListUserResponse from "../../model/response/user/ListUserResponse";
import User from "../../model/User";
import Loading from "../../components/Loading";
import ErrorResponse from "../../model/response/ErrorResponse";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080";

// Custom button component
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  className?: string; 
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; 
}> = ({ children, className, variant = "primary", ...props }) => {
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

// Custom card component
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

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    positive: boolean;
  };
  darkMode: boolean;
}> = ({ title, value, icon, change, darkMode }) => (
  <Card darkMode={darkMode} className="h-full">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg transition-colors duration-500 ${
        darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'
      }`}>
        {icon}
      </div>
      {change && (
        <div className={`flex items-center text-sm rounded-full px-2 py-0.5 ${
          change.positive 
            ? darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-50' 
            : darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-50'
        }`}>
          <TrendingUp className={`w-3 h-3 mr-1 ${change.positive ? '' : 'transform rotate-180'}`} />
          {change.value}
        </div>
      )}
    </div>
    <h3 className={`text-3xl font-bold mb-1 ${
      darkMode ? 'text-white' : 'text-slate-800'
    }`}>{value}</h3>
    <p className={`${
      darkMode ? 'text-slate-400' : 'text-slate-500'
    }`}>{title}</p>
  </Card>
);

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userImagesMap, setUserImagesMap] = useState<Record<string, string | null>>({});
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  
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

  const usersPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Check if user image exists
  const fetchUserImage = (userId: string) => {
    // Use timestamp to prevent caching
    const timestamp = new Date().getTime();
    const imageUrl = `${API_URL}/api/user/image/${userId}?t=${timestamp}`;
    
    // Create an image element to test if the image exists
    const img = new Image();
    img.onload = () => {
      setUserImagesMap(prev => ({ ...prev, [userId]: imageUrl }));
    };
    img.onerror = () => {
      setUserImagesMap(prev => ({ ...prev, [userId]: null }));
    };
    img.src = imageUrl;
  };

  // Fetch users data and check admin authorization
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }
    
    userService.getMe(token)
      .then((data) => {
        if (data.user.role !== "ADMIN") {
          toast.error("You are not authorized to view this page");
          navigate("/user/profile");
          return;
        }
        
        setCurrentAdmin(data.user);
        
        userService.getAllUsers(token)
          .then((data: ListUserResponse) => {
            setUsers(data.users.content);
            setFilteredUsers(data.users.content);
            
            // Check for user images for all users
            data.users.content.forEach(user => {
              if (user.id) {
                fetchUserImage(user.id);
              }
            });
            
            setLoading(false);
          })
          .catch((error: ErrorResponse) => {
            toast.error(error.message);
            setLoading(false);
          });
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
        navigate("/sign-in");
      });
  }, [navigate]);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(lowercasedQuery) || 
        user.email.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredUsers(filtered);
      setCurrentPage(1); // Reset to first page when searching
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleDelete = (id: string) => {
    // Prevent admins from deleting themselves
    const user = JSON.parse(localStorage.getItem("user") as string);
    if(id === user.id){
      toast.error("You cannot delete your own account");
      return;
    }
    
    const token = localStorage.getItem("token") as string;
    userService.deleteUser(token, id)
      .then(() => {
        setUsers(users.filter((user) => user.id !== id));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
        toast.success("User deleted successfully");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  // Get current page users
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const refreshUsers = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    
    userService.getAllUsers(token)
      .then((data: ListUserResponse) => {
        setUsers(data.users.content);
        setFilteredUsers(data.users.content);
        
        // Check for user images for all users
        data.users.content.forEach(user => {
          if (user.id) {
            fetchUserImage(user.id);
          }
        });
        
        setLoading(false);
        toast.success("User list refreshed");
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
        setLoading(false);
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
      {/* Header */}
      <AdminHeader 
        user={currentAdmin} 
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
        activeTab="dashboard" 
      />
    
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className={`text-2xl font-bold mb-4 sm:mb-0 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>Admin Dashboard</h1>
          <div className="flex space-x-3">
            <Button 
              onClick={refreshUsers} 
              variant="outline" 
              className="px-4 py-2 rounded-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to="/admin/settings">
              <Button variant="ghost" className="px-4 py-2 rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Statistics overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users"
            value={users.length}
            icon={<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            change={{ value: "+12%", positive: true }}
            darkMode={darkMode}
          />
          <StatCard 
            title="Active News Entries"
            value="245"
            icon={<BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            change={{ value: "+23%", positive: true }}
            darkMode={darkMode}
          />
          <StatCard 
            title="News Categories"
            value="16"
            icon={<PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            change={{ value: "+5%", positive: true }}
            darkMode={darkMode}
          />
          <StatCard 
            title="Inactive Users"
            value="8"
            icon={<UserX className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            change={{ value: "-3%", positive: false }}
            darkMode={darkMode}
          />
        </div>
        
        {/* Charts and user management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User management panel */}
          <Card 
            title="User Management" 
            className="lg:col-span-2"
            darkMode={darkMode}
          >
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-full rounded-lg border transition-colors duration-500 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                      : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              <Link to="/admin/create-user">
                <Button variant="primary" className="whitespace-nowrap px-4 py-2 rounded-lg">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </Link>
            </div>
            
            <div className={`rounded-lg overflow-hidden border transition-colors duration-500 ${
              darkMode ? 'border-slate-800' : 'border-slate-200' 
            }`}>
              <table className="w-full">
                <thead className={`text-left transition-colors duration-500 ${
                  darkMode ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <tr>
                    <th className={`px-4 py-3 font-medium ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>User</th>
                    <th className={`px-4 py-3 font-medium hidden sm:table-cell ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Email</th>
                    <th className={`px-4 py-3 font-medium ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Role</th>
                    <th className={`px-4 py-3 font-medium text-right ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y transition-colors duration-500 divide-slate-200 dark:divide-slate-800">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className={`transition-colors duration-500 ${
                      darkMode 
                        ? 'hover:bg-slate-800/50' 
                        : 'hover:bg-slate-50'
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-medium ${
                            darkMode ? 'bg-indigo-600' : 'bg-indigo-500'
                          }`}>
                            {userImagesMap[user.id] ? (
                              <img 
                                src={userImagesMap[user.id] || ""} 
                                alt={user.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className={`font-medium ${
                              darkMode ? 'text-white' : 'text-slate-800'
                            }`}>{user.name}</p>
                            <p className={`text-xs sm:hidden ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 hidden sm:table-cell ${
                        darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                            : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/admin/update/${user.id}`}>
                            <Button 
                              variant="ghost" 
                              className="p-1 rounded-full"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            className="p-1 rounded-full" 
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === currentAdmin?.id}
                            title={user.id === currentAdmin?.id ? "Cannot delete yourself" : "Delete user"}
                          >
                            <Trash2 className={`w-4 h-4 ${
                              user.id === currentAdmin?.id 
                                ? 'text-slate-400 dark:text-slate-600' 
                                : 'text-red-500 dark:text-red-400'
                            }`} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {currentUsers.length === 0 && (
                    <tr>
                      <td 
                        colSpan={4} 
                        className={`px-4 py-8 text-center ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {searchQuery ? 'No users match your search.' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className={`px-4 py-3 flex items-center justify-between border-t transition-colors duration-500 ${
                  darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Showing {Math.min((currentPage - 1) * usersPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      className="p-2 rounded"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className={`w-4 h-4 ${
                        currentPage === 1
                          ? darkMode ? 'text-slate-600' : 'text-slate-400'
                          : darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2 rounded"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className={`w-4 h-4 ${
                        currentPage === totalPages
                          ? darkMode ? 'text-slate-600' : 'text-slate-400'
                          : darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Statistics panel */}
          <Card title="User Statistics" darkMode={darkMode}>
            <div className={`aspect-square rounded-lg flex items-center justify-center transition-colors duration-500 ${
              darkMode 
                ? 'bg-slate-800' 
                : 'bg-slate-50'
            }`}>
              <div className="text-center">
                <PieChart className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-500'
                }`} />
                <p className={`${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  User Role Distribution
                </p>
              </div>
            </div>
            
            <div className={`mt-6 space-y-4 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    darkMode ? 'bg-indigo-400' : 'bg-indigo-500'
                  }`}></div>
                  <span>Regular Users</span>
                </div>
                <span className="font-semibold">{users.filter(u => u.role === "USER").length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    darkMode ? 'bg-purple-400' : 'bg-purple-500'
                  }`}></div>
                  <span>Administrators</span>
                </div>
                <span className="font-semibold">{users.filter(u => u.role === "ADMIN").length}</span>
              </div>
              
              <div className={`pt-4 mt-4 border-t ${
                darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <Link to="/admin/users" className={`flex items-center text-sm ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  <span>View detailed statistics</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;