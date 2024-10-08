import React, { FC, ReactNode } from "react";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  loading?: boolean;
};

// omg this is messy stylingwise - Juli

export const Button: FC<ButtonProps> = ({
  className = "",
  onClick,
  disabled = false,
  children,
  loading = false,
}) => {
  return (
    <button
      className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {loading ? (
        <div
          className="spinner"
          style={{
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            borderTop: "4px solid white",
            width: "16px",
            height: "16px",
            animation: "spin 1s linear infinite",
          }}
        />
      ) : (
        children
      )}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
};
