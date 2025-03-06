import React, { useState, useEffect, use } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useParams, useNavigate } from "react-router-dom";
import User from "../../model/User";
import Loading from "../../components/Loading";
import userService from "../../services/user.service";
import { toast } from "react-toastify";

const UserUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: null,
    role: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token") as string;

    if(!token){
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }

    userService.getMe(token).then((data) => {
      if (data.user.role !== "ADMIN") {
        navigate("/user/me");
        return
      }
    }).catch((error) => {
      toast.error(error.message);
      navigate("/sign-in");
    });

    if (id) {
      userService.getUserById(token, id).then((data) => {
        setFormData({
          name: data.user.name,
          email: data.user.email,
          password: null,
          role: null,
        });
        setLoading(false);
      }).catch((error) => {
        alert(error.message);
        navigate("/admin/dashboard");
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token") as string;

    if(id){
      userService.updateUser(formData, id, token).then(() => {
        toast.success("User updated successfully");
        navigate("/admin/dashboard");
      }).catch((error) => {
        toast.error(error.message);
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
      { loading ? (
        <Loading />
      ) : (
      <div className="bg-white text-black p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Update User</h2>
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="px-4 py-2 border rounded-lg"
            required
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="px-4 py-2 border rounded-lg"
            required
          />
          <Button type="submit" className="bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-lg">
            Save Changes
          </Button>
          <Button type="button" onClick={() => navigate("/admin/dashboard")} className="bg-gray-500 hover:bg-gray-400 text-white py-2 rounded-lg">
            Cancel
          </Button>
        </form>
      </div>
      )}
    </div>
  );
};

export default UserUpdatePage;
