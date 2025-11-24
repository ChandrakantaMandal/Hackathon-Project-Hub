import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import Input from "../../components/common/input";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success(
        "If an account exists with that email, you will receive a password reset link shortly"
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred. Please try again later."
      );
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
                Forgot Password
              </h2>
              <p className="text-white/70 text-sm">
                {!isSubmitted
                  ? "Enter your email to reset your password"
                  : "Check your email"}
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                    "Send Reset Link"
                  )}
                </motion.button>

                <div className="pt-4">
                  <Link
                    to="/signin"
                    className="flex items-center justify-center text-sm text-white/90 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
                >
                  <Mail className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-white/80 text-sm px-4">
                  If an account exists for{" "}
                  <span className="font-semibold text-white">{email}</span>, you
                  will receive a password reset link shortly.
                </p>
                <div className="pt-4">
                  <Link
                    to="/signin"
                    className="flex items-center justify-center text-sm text-white/90 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
