import React from "react";
import { Button } from "../components/Button";

const UserProfilePage: React.FC = () => {
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Administrator",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
      <div className="bg-white text-black p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-4">User Profile</h2>
        <p className="text-lg"><strong>Name:</strong> {user.name}</p>
        <p className="text-lg"><strong>Email:</strong> {user.email}</p>
        <p className="text-lg"><strong>Role:</strong> {user.role}</p>
        <Button className="mt-6 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default UserProfilePage;
