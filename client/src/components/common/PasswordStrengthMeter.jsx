import { Check, X } from "lucide-react";
import React from "react";

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At Least 6 Characters", met: password.length >= 6 },
    { label: "Contains Uppercase Letter", met: /[A-Z]/.test(password) },
    { label: "Contains Lowercase Letter", met: /[a-z]/.test(password) },
    { label: "Contains a Number", met: /\d/.test(password) },
    {
      label: "Contains a Special Character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
  return (
    <div className="mt-3 space-y-2">
      {criteria.map((item) => (
        <div key={item.label} className="flex items-center text-xs">
          {item.met ? (
            <Check className="w-4 h-4 text-green-400 mr-2" />
          ) : (
            <X className="w-4 h-4 text-white/30 mr-2" />
          )}
          <span className={item.met ? "text-green-400" : "text-white/50"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };
  const strength = getStrength(password);

  const getColor = (strength) => {
    if (strength === 0) return "bg-red-400";
    if (strength === 1) return "bg-orange-400";
    if (strength === 2) return "bg-yellow-400";
    if (strength === 3) return "bg-lime-400";
    return "bg-green-400";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-white/60 font-medium">
          Password Strength
        </span>
        <span className="text-xs text-white/80 font-semibold">
          {getStrengthText(strength)}
        </span>
      </div>
      <div className="flex space-x-1.5">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`h-1.5 w-1/4 rounded-full transition-all duration-300 ${
              index < strength ? getColor(strength) : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};

export default PasswordStrengthMeter;
