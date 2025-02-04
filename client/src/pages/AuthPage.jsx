import { useState } from "react";
import backgroundImage from '../images/img2.jpg';
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-opacity-95 p-4"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(26, 26, 26, 0.9)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
          {isLogin ? <LoginForm /> : <SignUpForm />}
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