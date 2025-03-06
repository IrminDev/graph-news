import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white text-black p-4 rounded-2xl shadow-xl">
      <div className="w-full h-40 bg-gray-300 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-gray-600">Image Placeholder</span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      {children}
    </div>
  );
};
