import React, { FC, ReactNode } from "react";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
};

export const Button: FC<ButtonProps> = ({
  className = "",
  onClick,
  disabled = false,
  children,
}) => {
  return (
    <button
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
