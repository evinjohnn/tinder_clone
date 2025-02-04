import { useState } from "react";
import backgroundImage from '../images/img2.jpg';
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-opacity-95 p-4 relative"
    >
      {/* Background with gradient and image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(26, 26, 26, 0.7)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Grain overlay */}
      <div 
        className="absolute inset-0 z-10 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Content */}
      <div className="w-full max-w-md relative z-20">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-400/20" />
          <h2 className="text-3xl font-bold text-white transition-opacity duration-500 ease-in-out">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="mt-2 text-gray-400 transition-opacity duration-500 ease-in-out">
            {isLogin
              ? "Sign in to continue your journey"
              : "Join millions of others"}
          </p>
        </div>
        <div 
          className="backdrop-blur-xl bg-black/30 rounded-3xl p-8 border border-zinc-700/30 shadow-2xl"
          style={{
            transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <div 
            className="transition-all duration-500 ease-in-out"
            style={{
              opacity: 1,
              transform: 'translateY(0)'
            }}
          >
            {isLogin ? <LoginForm /> : <SignUpForm />}
            <div className="mt-8 text-center">
              <p className="text-gray-300 transition-opacity duration-500 ease-in-out">
                {isLogin ? "New to the app?" : "Already have an account?"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="mt-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-all duration-500 ease-in-out"
              >
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-300">
          By continuing, you agree to our{" "}
          <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors duration-500 ease-in-out">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors duration-500 ease-in-out">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;