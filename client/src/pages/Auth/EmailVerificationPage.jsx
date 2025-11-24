import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { toast } from "react-hot-toast";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { error, isLoading, verifyEmail } = useAppStore();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSumit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      console.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      await verifyEmail(verificationCode);
      navigate("/dashboard");
      toast.success("Email Verified Successfully! Account created.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Verification failed";
      console.error("Verification error:", errorMessage);
      toast.error(errorMessage);

      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("Invalid")
      ) {
        setTimeout(() => {
          navigate("/signup");
          toast.error("Please register again");
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSumit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="min-h-screen gradient-purple-blue flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>

        <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/30">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block mb-3"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <RocketLaunchIcon className="w-7 h-7 text-white" />
                </div>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-white tracking-tight">
                Verify Your Email
              </h2>
              <p className="text-white/70 text-sm">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <form onSubmit={handleSumit} className="space-y-6">
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    maxLength="6"
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold bg-white/5 text-white border-2 border-white/20 rounded-xl focus:border-white/60 focus:bg-white/10 focus:outline-none transition-all duration-200"
                  />
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 font-semibold text-sm bg-red-500/20 p-3 rounded-xl border border-red-500/30 text-center"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                className="w-full py-3.5 bg-gradient-to-r from-white to-white/95 text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-white/95 hover:to-white focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-200"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Verify Email"
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
