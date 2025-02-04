import { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-opacity-95 p-4"
      style={{
        background: "linear-gradient(to bottom, #000000, #1a1a1a)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-yellow-400" />
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="mt-2 text-gray-400">
            {isLogin
              ? "Sign in to continue your journey"
              : "Join millions of others"}
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-6 py-3 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-6 py-3 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors"
            />
            <button
              className="w-full py-3 px-6 rounded-full font-semibold text-black transition-colors duration-200"
              style={{
                background: "linear-gradient(45deg, #F8B704, #FFC629)",
                boxShadow: "0 2px 10px rgba(248, 183, 4, 0.3)"
              }}
            >
              {isLogin ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {isLogin ? "New to the app?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="text-yellow-400 hover:text-yellow-300">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-yellow-400 hover:text-yellow-300">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;