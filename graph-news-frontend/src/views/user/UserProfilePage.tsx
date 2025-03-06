import React, { useState, useEffect} from "react";
import { Button } from "../../components/Button";
import Loading from "../../components/Loading";
import userService from "../../services/user.service";
import { Link, useNavigate } from "react-router-dom";
import GetUserResponse from "../../model/response/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";
import { toast } from "react-toastify";

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }

    userService.getMe(token).then((data: GetUserResponse) => {
      setUser({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      setLoading(false);
    }).catch((error: ErrorResponse) => {
      toast.error(error.message);
      navigate("/sign-in");
    })
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white text-black p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">User Profile</h2>
          <p className="text-lg"><strong>Name:</strong> {user.name}</p>
          <p className="text-lg"><strong>Email:</strong> {user.email}</p>
          <p className="text-lg"><strong>Role:</strong> {user.role}</p>
          <Button onClick={handleLogout} className="mt-6 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl">
            Logout
          </Button>

          { user.role === "ADMIN" && (
            <Link to="/admin/dashboard">
              <Button className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl">
                Admin Dashboard
              </Button>
            </Link>
          )
          }
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
