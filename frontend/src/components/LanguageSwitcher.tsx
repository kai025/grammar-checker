import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2">
        <FaGlobe className="h-4 w-4 text-gray-500" />
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="zh">中文</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
