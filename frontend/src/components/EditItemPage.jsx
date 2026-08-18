import React, { useState } from "react";
import axios from "axios";

export default function EditItemPage({ item, type, onSuccess, onCancel }) {
  // Initializing state with all possible service and product fields
  const [form, setForm] = useState({ 
    ...item,
    RoomIDs: item.RoomIDs || "", 
    StaffIDs: item.StaffIDs || "",
    Duration: item.Duration || 30, // Default to 30 if missing
    Stock: item.Stock || 0
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = type === "products" 
        ? `http://localhost:5000/api/products/${item.Name}` 
        : `http://localhost:5000/api/services/${item.Name}`;

      const payload = {
        ...form,
        Price: parseFloat(form.Price),
        // Ensure Duration is sent as a number for services
        Duration: type === "services" ? parseInt(form.Duration) : undefined
      };

      if (type === "products") {
        payload.Stock = parseInt(form.Stock);
      }

      await axios.put(endpoint, payload);

      alert("Updated successfully!");
      onSuccess();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.error || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#faf9f6] pt-10">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-pink-600 text-[10px] font-bold uppercase tracking-widest">
              Editing {type === "products" ? "Product" : "Service"}
            </p>
            <h2 className="text-4xl font-serif italic tracking-tighter">{item.Name}</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-black uppercase text-[10px] font-bold">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Display Name</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-pink-200"
                value={form.Name} onChange={e => setForm({...form, Name: e.target.value})} required />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Price ($)</label>
              <input type="number" step="0.01" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                value={form.Price} onChange={e => setForm({...form, Price: e.target.value})} required />
            </div>

            {type === "products" ? (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Stock Level</label>
                <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  value={form.Stock} onChange={e => setForm({...form, Stock: e.target.value})} required />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Duration (Mins)</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-pink-50"
                    value={form.Duration} onChange={e => setForm({...form, Duration: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Staff IDs</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                    value={form.StaffIDs} onChange={e => setForm({...form, StaffIDs: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Room Numbers / IDs</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-pink-50 focus:border-pink-200"
                    placeholder="e.g. Room 1, Room 2"
                    value={form.RoomIDs} onChange={e => setForm({...form, RoomIDs: e.target.value})} />
                </div>
              </>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg disabled:bg-gray-400">
            {loading ? "Saving Changes..." : "Update Item"}
          </button>
        </form>
      </div>
    </div>
  );
}