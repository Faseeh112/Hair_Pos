import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddServicePage({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ Name: "", Price: "", StaffIDs: "", RoomIDs: "", Description: "", Duration: "30" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Validation: The backend route /api/services/<name> (PUT) or POST 
      // already checks if Staff exists, but we do it here for a better UI.
      const payload = {
        ...form,
        Price: parseFloat(form.Price),
        Duration: form.Duration + " mins"
      };

      const res = await axios.post("http://localhost:5000/api/services", payload);
      alert("Service created successfully!");
      onSuccess();
    } catch (err) {
      // If the backend returns "Staff ID X does not exist"
      alert(err.response?.data?.error || "Error creating service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#faf9f6] pt-10">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-serif italic tracking-tighter">Add New Service</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-black uppercase text-[10px] tracking-widest font-bold">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Service Name</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="e.g., Bridal Hair Styling"
                onChange={e => setForm({...form, Name: e.target.value})} required />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Price ($)</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 outline-none"
                onChange={e => setForm({...form, Price: e.target.value})} required />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Duration (Mins)</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 outline-none"
                value={form.Duration} onChange={e => setForm({...form, Duration: e.target.value})} required />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Assign Staff (IDs)</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="STF001, STF002"
                onChange={e => setForm({...form, StaffIDs: e.target.value})} required />
              <p className="text-[9px] text-gray-400 mt-2 italic">Separated by commas. System will verify if IDs exist.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Room IDs</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="Room A, Room B"
                onChange={e => setForm({...form, RoomIDs: e.target.value})} required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg disabled:bg-gray-300">
            {loading ? "Verifying Staff..." : "Register Service"}
          </button>
        </form>
      </div>
    </div>
  );
}