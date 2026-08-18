import React, { useState } from "react";
import axios from "axios";

export default function AddStaffPage({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ Name: "", StaffID: "", Role: "user", Password: "" });
  const [createLogin, setCreateLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the Staff Profile
      await axios.post("http://localhost:5000/api/staff", {
        Name: form.Name,
        StaffID: form.StaffID,
        LeaveStart: null,
        LeaveEnd: null
      });

      // 2. If "Create Login" is checked, create the user account
      if (createLogin) {
        await axios.post("http://localhost:5000/api/admin/create-account", {
          username: form.Name.toLowerCase().replace(/\s/g, ''), // auto-username
          password: form.Password || "123456", // default password if empty
          role: form.Role
        });
      }

      alert("Staff Member Registered Successfully!");
      onSuccess();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Connection failed"));
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#faf9f6] pt-10">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-serif italic tracking-tighter">Register Staff</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-black uppercase text-[10px] tracking-widest font-bold">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g. Dr. Sarah Johnson"
                onChange={e => setForm({...form, Name: e.target.value})} required />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Staff ID (Used for Services)</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="STF-001"
                onChange={e => setForm({...form, StaffID: e.target.value})} required />
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input type="checkbox" id="login" checked={createLogin} onChange={() => setCreateLogin(!createLogin)} className="w-5 h-5 accent-pink-600" />
              <label htmlFor="login" className="text-[11px] font-bold uppercase text-gray-600">Create System Login?</label>
            </div>
          </div>

          {createLogin && (
            <div className="p-6 bg-pink-50 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4">
              <p className="text-[10px] font-bold text-pink-600 uppercase mb-2">Account Credentials</p>
              <div className="grid grid-cols-2 gap-4">
                <input type="password" placeholder="Set Password" 
                  className="w-full p-3 rounded-xl border-none outline-none"
                  onChange={e => setForm({...form, Password: e.target.value})} required={createLogin} />
                <select className="p-3 rounded-xl border-none outline-none"
                  onChange={e => setForm({...form, Role: e.target.value})}>
                  <option value="user">User Role</option>
                  <option value="admin">Admin Role</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}