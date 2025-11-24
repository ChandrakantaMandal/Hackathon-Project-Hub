import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/common/input";
import { Lock, Loader } from "lucide-react";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading, message } = useAppStore();

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);

      toast.success(
        "Password reset successfully, redirecting to login page..."
      );
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error resetting password");
    }
  };

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
                Reset Password
              </h2>
              <p className="text-white/70 text-sm">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                icon={Lock}
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                icon={Lock}
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 font-semibold text-sm bg-red-500/20 p-3 rounded-xl border border-red-500/30"
                >
                  {error}
                </motion.p>
              )}

              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-300 font-semibold text-sm bg-green-500/20 p-3 rounded-xl border border-green-500/30"
                >
                  {message}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-gradient-to-r from-white to-white/95 text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-white/95 hover:to-white focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-200"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Set New Password"
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
