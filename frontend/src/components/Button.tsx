import type React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "neutral" | "primary" | "primary-accent";
  style?: "filled" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "neutral",
  style = "filled",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transform hover:scale-101 hover:translate-y-[-0.5px] active:translate-y-[0px]";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    neutral: {
      filled:
        "bg-gray-500 text-white hover:bg-gray-400 focus:ring-gray-500 hover:shadow-sm active:shadow-xs hover:bg-gray-400",
      outline:
        "border-1 border-gray-500 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 hover:shadow-sm active:shadow-xs hover:border-gray-600 hover:bg-gray-100",
    },
    primary: {
      filled:
        "bg-primary-500 text-white hover:bg-primary-400 hover:text-white focus:ring-primary-500 hover:shadow-sm active:shadow-xs hover:bg-primary-400",
      outline:
        "border-1 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500 hover:shadow-sm active:shadow-xs hover:border-primary-600 hover:bg-primary-100",
    },
    "primary-accent": {
      filled:
        "bg-primary-500 text-accent-500 hover:bg-primary-600 focus:ring-primary-500 hover:shadow-sm active:shadow-xs hover:bg-primary-400",
      outline:
        "border-1 border-primary-500 text-accent-500 hover:bg-primary-50 focus:ring-primary-500 hover:shadow-sm active:shadow-xs hover:border-primary-600 hover:bg-primary-100",
    },
  };

  const classes = [baseClasses, sizeClasses[size], variantClasses[variant][style], className].join(
    " "
  );

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
