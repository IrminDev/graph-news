import React, { useState, useEffect} from "react";
import { Button } from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../services/user.service";
import ListUserResponse from "../../model/response/ListUserResponse";
import User from "../../model/User";
import Loading from "../../components/Loading";
import ErrorResponse from "../../model/response/ErrorResponse";
import { toast } from "react-toastify";

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([] as User[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }

    userService.getMe(token).then((data) => {
      if (data.user.role !== "ADMIN") {
        toast.error("You are not authorized to view this page");
        navigate("/user/me");
        return;
      }
      userService.getAllUsers(token).then((data: ListUserResponse) => {
        setUsers(data.users);
        setLoading(false);
      }).catch((error: ErrorResponse) => {
        toast.error(error.message);
      })
    }).catch((error: ErrorResponse) => {
      toast.error(error.message);
      navigate("/sign-in");
    })
  }, []);

  const handleDelete = (id: string) => {
    const user = JSON.parse(localStorage.getItem("user") as string);
    console.log(user);
    if(id === user.id){
      return;
    }
    
    const token = localStorage.getItem("token") as string;
    userService.deleteUser(token, id).then(() => {
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully");
    }).catch((error) => {
      toast.error(error.message);
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
      <h2 className="text-4xl font-bold mb-6">Admin Dashboard</h2>
      <div className="w-full max-w-4xl space-y-4">
        { loading ? (
          <Loading />
        ) :
          users.map((user) => (
            <div key={user.id} className="bg-white text-black p-4 rounded-2xl shadow-xl flex justify-between items-center">
              <div>
                <p className="text-xl font-bold">{user.name}</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/update/${user.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Update
                  </Button>
                </Link>
                <Button onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg">
                  Delete
                </Button>
              </div>
            </div>
          ))}
      </div>

      <Link to={"/user/me"}>
        <Button className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl">
          Go back
        </Button>
      </Link>
    </div>
  );
};

export default AdminDashboardPage;
