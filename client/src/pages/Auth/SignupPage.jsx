import React, { useState } from "react";
import { motion } from "framer-motion";
import Input from "../../components/common/input";
import { Mail, User, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import PasswordStrengthMeter from "../../components/common/PasswordStrengthMeter";
import { useAppStore } from "../../store/useAppStore";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, error, loading } = useAppStore();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate("/verify-email");
    } catch (err) {
      console.error(err);
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
                Create Account
              </h2>
              <p className="text-white/70 text-sm">
                Join HackHub and start building amazing projects
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <Input
                icon={User}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

              <PasswordStrengthMeter password={password} />

              <motion.button
                className="mt-6 w-full py-3.5 bg-gradient-to-r from-white to-white/95 text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-white/95 hover:to-white focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-200"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="animate-spin mx-auto" size={24} />
                ) : (
                  "Create Account"
                )}
              </motion.button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full  border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-white/60">
                    Already a member?
                  </span>
                </div>
              </div>

              <Link to="/signin">
                <motion.button
                  type="button"
                  className="w-full py-3.5 bg-white/5 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-200"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                >
                  Sign In Instead
                </motion.button>
              </Link>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
