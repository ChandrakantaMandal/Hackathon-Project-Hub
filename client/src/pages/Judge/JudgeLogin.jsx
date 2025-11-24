import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Code, Briefcase, Loader } from "lucide-react";
import { ScaleIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api";
import Input from "../../components/common/input";
import toast from "react-hot-toast";

const JudgeLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    judgeCode: "",
    specialization: "general",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/judge/login" : "/judge/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        localStorage.setItem("judgeToken", res.data.data.token);
        localStorage.setItem("judge", JSON.stringify(res.data.data.judge));
        toast.success(
          isLogin ? "Login successful!" : "Registration successful!"
        );
        navigate("/judge/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      const message = error.response?.data?.message || "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      judgeCode: "",
      specialization: "general",
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen gradient-purple-blue flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
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

      {/* Judge Auth Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>

        <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/30">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block mb-3"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <ScaleIcon className="w-7 h-7 text-white" />
                </div>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-white tracking-tight">
                Judge Portal
              </h2>
              <p className="text-white/70 text-sm">
                {isLogin
                  ? "Sign in to your judge account"
                  : "Create your judge account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <Input
                    icon={User}
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />

                  <div>
                    <Input
                      icon={Code}
                      type="text"
                      placeholder="Judge Access Code (e.g., JUDGE2024)"
                      value={formData.judgeCode}
                      onChange={(e) =>
                        setFormData({ ...formData, judgeCode: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-white/60 mt-1.5 ml-1">
                      Contact admin for your judge access code
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Briefcase className="w-5 h-5 text-white/50" />
                    </div>
                    <select
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 focus:border-white/40 focus:bg-white/10 focus:ring-2 focus:ring-white/20 text-white placeholder-white/40 transition-all duration-200 outline-none"
                    >
                      <option value="general" className="bg-gray-800">
                        General
                      </option>
                      <option value="web" className="bg-gray-800">
                        Web Development
                      </option>
                      <option value="mobile" className="bg-gray-800">
                        Mobile Development
                      </option>
                      <option value="ai" className="bg-gray-800">
                        AI/ML
                      </option>
                      <option value="blockchain" className="bg-gray-800">
                        Blockchain
                      </option>
                      <option value="iot" className="bg-gray-800">
                        IoT
                      </option>
                      <option value="game" className="bg-gray-800">
                        Game Development
                      </option>
                    </select>
                  </div>
                </>
              )}

              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <div>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                {!isLogin && (
                  <p className="text-xs text-white/60 mt-1.5 ml-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <motion.button
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-200"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="w-6 h-6 animate-spin mx-auto" />
                ) : isLogin ? (
                  "Sign In as Judge"
                ) : (
                  "Create Judge Account"
                )}
              </motion.button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full  border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4   text-white/60">
                  {isLogin
                    ? "Don't have a judge account?"
                    : "Already have an account?"}
                </span>
              </div>
            </div>

            {/* Toggle Mode Button */}
            <motion.button
              type="button"
              onClick={toggleMode}
              className="w-full py-3.5 bg-white/5 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-200"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
            >
              {isLogin ? "Create Judge Account" : "Sign In as Judge"}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="block w-full text-white/70 hover:text-white text-sm mt-4 transition-colors duration-200"
            >
              ← Back to Landing Page
            </button>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30"
              >
                <p className="text-xs text-amber-200">
                  <strong>Note:</strong> You need a valid judge code to
                  register. Contact the hackathon organizers to get your judge
                  access code.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JudgeLogin;
