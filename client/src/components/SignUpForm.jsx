import { useState } from "react";
import backgroundImage from '../images/img2.jpg';
import { useAuthStore } from "../store/useAuthStore";

const SignUpForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [genderPreference, setGenderPreference] = useState("");

  const { signup, loading } = useAuthStore();

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-6 py-3 bg-black/20 backdrop-blur-xl text-white rounded-full border border-zinc-700/30 focus:outline-none focus:border-yellow-400 transition-colors"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-6 py-3 bg-black/20 backdrop-blur-xl text-white rounded-full border border-zinc-700/30 focus:outline-none focus:border-yellow-400 transition-colors"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-6 py-3 bg-black/20 backdrop-blur-xl text-white rounded-full border border-zinc-700/30 focus:outline-none focus:border-yellow-400 transition-colors"
      />
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="w-full px-6 py-3 bg-black/20 backdrop-blur-xl text-white rounded-full border border-zinc-700/30 focus:outline-none focus:border-yellow-400 transition-colors"
      />
      
      {/* Gender Selection */}
      <div className="grid grid-cols-2 gap-4">
        {["male", "female"].map((option) => (
          <button
            key={option}
            onClick={() => setGender(option)}
            className={`w-full py-3 rounded-full transition-colors duration-200 ${
              gender === option 
                ? "bg-yellow-400 text-black" 
                : "bg-black/20 backdrop-blur-xl text-gray-300 border border-zinc-700/30"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Gender Preference */}
      <div className="grid grid-cols-3 gap-4">
        {["male", "female", "both"].map((option) => (
          <button
            key={option}
            onClick={() => setGenderPreference(option)}
            className={`w-full py-3 rounded-full transition-colors duration-200 ${
              genderPreference === option 
                ? "bg-yellow-400 text-black" 
                : "bg-black/20 backdrop-blur-xl text-gray-300 border border-zinc-700/30"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          signup({ name, email, password, gender, age, genderPreference });
        }}
        disabled={loading}
        className="w-full py-3 px-6 rounded-full font-semibold text-black transition-colors duration-200"
        style={{
          background: "linear-gradient(45deg, #F8B704, #FFC629)",
          boxShadow: "0 2px 10px rgba(248, 183, 4, 0.3)"
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </div>
  );
};

export default SignUpForm;