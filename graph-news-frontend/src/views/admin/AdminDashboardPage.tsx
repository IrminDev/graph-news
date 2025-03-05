import React from "react";
import { Button } from "../../components/Button";
import { Link } from "react-router-dom";

const users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "User" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Administrator" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "User" },
];

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
      <h2 className="text-4xl font-bold mb-6">Admin Dashboard</h2>
      <div className="w-full max-w-4xl space-y-4">
        {users.map((user) => (
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
              <Button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
