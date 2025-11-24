import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ icon: Icon, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Icon className="w-5 h-5 text-white/50" />
      </div>
      <input
        {...props}
        type={isPasswordField && showPassword ? "text" : type}
        className="w-full pl-12 pr-12 py-3.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 focus:border-white/40 focus:bg-white/10 focus:ring-2 focus:ring-white/20 text-white placeholder-white/40 transition-all duration-200 outline-none"
      />
      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/50 hover:text-white/80 transition-colors duration-200"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

export default Input;
