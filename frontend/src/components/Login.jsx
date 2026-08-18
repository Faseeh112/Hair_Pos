import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? "signup" : "login";
    try {
      const res = await axios.post(`http://localhost:5000/api/${endpoint}`, formData);
      onLogin(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-serif">
      <div className="bg-white p-12 rounded-3xl shadow-2xl w-[450px]">
        <h2 className="text-4xl font-black italic mb-2 tracking-tighter">HAIR<span className="text-pink-600 not-italic">POS</span></h2>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">{isSignup ? "Create your account" : "Welcome Back"}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2">Username</label>
            <input 
              type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition"
              onChange={(e) => setFormData({...formData, username: e.target.value})} required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2">Password</label>
            <input 
              type="password" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required
            />
          </div>
          <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-pink-600 transition shadow-lg">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="mt-8 text-sm text-gray-500 text-center">
          {isSignup ? "Already have an account?" : "Need an account?"} 
          <span onClick={() => setIsSignup(!isSignup)} className="text-pink-600 font-bold cursor-pointer ml-2 underline">
            {isSignup ? "Log In" : "Register Now"}
          </span>
        </p>
      </div>
    </div>
  );
}