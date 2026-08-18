import React, { useState } from "react";
import axios from "axios";

export default function AddProductPage({ onSuccess }) {
  const [form, setForm] = useState({ Name: "", Price: "", Stock: "", Image: "" });

  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, Image: reader.result });
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATION: Ensure stock is sent as a number
    const payload = {
      ...form,
      Price: parseFloat(form.Price),
      Stock: parseInt(form.Stock) || 0 // This ensures stock is not empty
    };

    try {
      await axios.post("http://localhost:5000/api/products", payload);
      alert("Product Created Successfully!");
      onSuccess(); // Trigger refresh and redirect
    } catch (err) {
      alert("Error creating product: " + err.response?.data?.error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Inventory Item</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Product Name</label>
          <input type="text" placeholder="e.g. Scalp Serum" style={styles.input}
            onChange={e => setForm({...form, Name: e.target.value})} required />

          <div style={styles.row}>
            <div style={{flex: 1}}>
              <label style={styles.label}>Price ($)</label>
              <input type="number" step="0.01" style={styles.input}
                onChange={e => setForm({...form, Price: e.target.value})} required />
            </div>
            <div style={{flex: 1}}>
              <label style={styles.label}>Initial Stock Count</label>
              <input type="number" style={styles.input}
                onChange={e => setForm({...form, Stock: e.target.value})} required />
            </div>
          </div>

          <label style={styles.label}>Product Image</label>
          <input type="file" accept="image/*" onChange={handleFile} style={styles.input} />
          
          {form.Image && <img src={form.Image} alt="Preview" style={styles.preview} />}

          <button type="submit" style={styles.submitBtn}>Save to Inventory</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", padding: "40px" },
  card: { background: "#fff", padding: "40px", borderRadius: "24px", width: "100%", maxWidth: "500px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  title: { fontWeight: "900", marginBottom: "30px", fontSize: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" },
  input: { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "16px" },
  row: { display: "flex", gap: "20px" },
  preview: { width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px", marginTop: "10px" },
  submitBtn: { background: "#000", color: "#fff", padding: "15px", borderRadius: "12px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }
};