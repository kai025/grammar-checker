import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock, FaUser, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "@/components/Button";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validatePassword = (password: string) => {
    const minLength = 8;

    const errors = [];
    if (password.length < minLength) {
      errors.push(t("auth.register.passwordRequirements.minLength"));
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(", "));
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      navigate("/pnl");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.register.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: "gray", text: "" };

    const minLength = 8;

    let strength = 0;
    if (password.length >= minLength) strength++;

    const strengthMap = {
      0: { color: "red", text: t("auth.register.strength.weak") },
      1: { color: "green", text: t("auth.register.strength.strong") },
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#05164d]/10">
            <FaUserPlus className="h-6 w-6 text-[#05164d]" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("auth.register.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.register.subtitle").split("Or")[0]}{" "}
            <Link to="/login" className="font-medium text-[#05164d] hover:text-[#0a2a7a]">
              {t("auth.register.subtitle").split("Or")[1]}
            </Link>
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.register.name")}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.register.email")}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.register.password")}
                value={formData.password}
                onChange={handleChange}
              />
              <Button
                type="button"
                variant="neutral"
                style="outline"
                size="sm"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
                        level <= passwordStrength.strength
                          ? `bg-${passwordStrength.color}-500`
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.text && (
                  <p className={`text-sm text-${passwordStrength.color}-600`}>
                    {passwordStrength.text}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? "border-red-300 placeholder-red-500 text-red-900"
                    : "border-gray-300 placeholder-gray-500 text-gray-900"
                }`}
                placeholder={t("auth.register.confirmPassword")}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Button
                type="button"
                variant="neutral"
                style="outline"
                size="sm"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="text-sm">
                {formData.password === formData.confirmPassword ? (
                  <p className="text-green-600">{t("auth.register.passwordMatch")}</p>
                ) : (
                  <p className="text-red-600">{t("auth.register.passwordNotMatch")}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={
                isLoading ||
                formData.password !== formData.confirmPassword ||
                passwordStrength.strength < 1
              }
              variant="primary"
              style="filled"
              size="lg"
              className="w-full bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("auth.register.loading") : t("auth.register.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
