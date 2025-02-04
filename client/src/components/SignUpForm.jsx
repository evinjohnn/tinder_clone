import { useState } from "react";
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
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        signup({ name, email, password, gender, age, genderPreference });
      }}
    >
      {/* Basic Info Section */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-6 py-3 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors placeholder-zinc-500"
          required
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-6 py-3 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors placeholder-zinc-500"
          required
        />

        <input
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-6 py-3 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors placeholder-zinc-500"
          required
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="18"
          max="120"
          className="w-full px-6 py-3 bg-zinc-800 text-white rounded-full border border-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors placeholder-zinc-500"
          required
        />
      </div>

      {/* Gender Selection */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400 ml-4">I am a</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`flex-1 py-3 px-6 rounded-full font-medium transition-colors duration-200 border ${
              gender === "male"
                ? "bg-yellow-400 text-black border-transparent"
                : "border-zinc-700 text-white hover:border-yellow-400"
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            className={`flex-1 py-3 px-6 rounded-full font-medium transition-colors duration-200 border ${
              gender === "female"
                ? "bg-yellow-400 text-black border-transparent"
                : "border-zinc-700 text-white hover:border-yellow-400"
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Gender Preference */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400 ml-4">I want to meet</p>
        <div className="flex flex-wrap gap-3">
          {["male", "female", "both"].map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setGenderPreference(pref)}
              className={`flex-1 py-3 px-6 rounded-full font-medium transition-colors duration-200 border ${
                genderPreference === pref
                  ? "bg-yellow-400 text-black border-transparent"
                  : "border-zinc-700 text-white hover:border-yellow-400"
              }`}
            >
              {pref.charAt(0).toUpperCase() + pref.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-full font-semibold text-black transition-colors duration-200 disabled:opacity-50"
        style={{
          background: "linear-gradient(45deg, #F8B704, #FFC629)",
          boxShadow: "0 2px 10px rgba(248, 183, 4, 0.3)"
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
};

export default SignUpForm;