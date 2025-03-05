import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input className={`border px-4 py-2 rounded-lg w-full ${className}`} {...props} />
  );
};
