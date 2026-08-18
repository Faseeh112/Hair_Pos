import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Sales() {
  const [salesData, setSalesData] = useState([]);
  const [filter, setFilter] = useState({ from: "", to: "" });

  const fetchSales = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/sales`, {
        params: { from: filter.from, to: filter.to }
      });
      setSalesData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const totalRevenue = salesData.reduce((acc, curr) => acc + (Number(curr.Total) || 0), 0);

  return (
    <div style={{ padding: "20px" }}>
      <div style={styles.cardStyle}>
        {/* FILTER HEADER */}
        <div style={styles.filterHeader}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
            <div>
              <label style={styles.labelStyle}>From Date:</label>
              <input 
                type="date" 
                value={filter.from} 
                style={styles.inputStyle} 
                onChange={e => setFilter({...filter, from: e.target.value})} 
              />
            </div>
            <div>
              <label style={styles.labelStyle}>To Date:</label>
              <input 
                type="date" 
                value={filter.to} 
                style={styles.inputStyle} 
                onChange={e => setFilter({...filter, to: e.target.value})} 
              />
            </div>
            <button onClick={fetchSales} style={styles.filterBtn}>Apply Filter</button>
          </div>
          
          <div style={styles.statBox}>
            <span style={styles.labelStyle}>TOTAL REVENUE</span>
            <div style={styles.revenueText}>${totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* SALES LIST */}
        <div style={{ marginTop: "20px" }}>
          {salesData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              No sales found for this period.
            </div>
          ) : (
            salesData.map((sale, index) => (
              <div key={index} style={styles.rowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {new Date(sale.Date).toLocaleDateString()} 
                    <span style={{ color: "#94a3b8", fontWeight: "normal", marginLeft: "10px" }}>
                      {new Date(sale.Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* FIXED ITEM LISTING LOGIC */}
                  <div style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>
                    {sale.FullDetails && sale.FullDetails.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {sale.FullDetails.map((item, i) => (
                          <span key={i} style={styles.itemTag}>
                             {item.quantity || 1}x {item.name || item.Name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      // Fallback if FullDetails is missing but Items array exists
                      sale.Items ? sale.Items.join(", ") : "No items listed"
                    )}
                  </div>

                  {/* Show Slot Info if it's a booking */}
                  {sale.FullDetails?.some(d => d.StartTime) && (
                    <div style={styles.slotBadge}>📅 Appointment Booked</div>
                  )}
                </div>
                
                <div style={styles.amountText}>
                  ${Number(sale.Total || 0).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// PREMIUM STYLES
const styles = {
  cardStyle: { background: "#fff", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" },
  filterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '30px', borderBottom: '2px solid #f8fafc' },
  labelStyle: { display: 'block', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px', color: '#94a3b8', letterSpacing: '1px' },
  inputStyle: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc' },
  filterBtn: { background: "#000", color: "#fff", border: "none", padding: "12px 25px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" },
  statBox: { textAlign: 'right' },
  revenueText: { fontSize: '32px', fontWeight: '900', color: '#10b981' },
  rowStyle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #f1f5f9' },
  amountText: { fontWeight: "800", color: "#000", fontSize: "18px" },
  itemTag: { background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", color: "#475569" },
  slotBadge: { display: "inline-block", marginTop: "8px", padding: "4px 8px", background: "#f0f9ff", color: "#0284c7", fontSize: "10px", borderRadius: "6px", fontWeight: "bold" }
};