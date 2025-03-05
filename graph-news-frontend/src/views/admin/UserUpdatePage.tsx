import React, { useState } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useParams, useNavigate } from "react-router-dom";

const mockUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com" },
];

const UserUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = mockUsers.find((user) => user.id === id);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        User not found
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated User:", formData);
    navigate("/admin-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
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
    </div>
  );
};

export default UserUpdatePage;
