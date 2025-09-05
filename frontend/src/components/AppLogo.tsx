import React from "react";

interface AppLogoProps {
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* First bar - shortest, accent pink */}
      <rect x="6" y="20" width="6" height="8" rx="2" fill="#ffb6c1" />

      {/* Second bar - medium height, blend color */}
      <rect x="13" y="14" width="6" height="14" rx="2" fill="#8866a3" />

      {/* Third bar - tallest, primary blue */}
      <rect x="20" y="6" width="6" height="22" rx="2" fill="#05164d" />
    </svg>
  );
};

export default AppLogo;
