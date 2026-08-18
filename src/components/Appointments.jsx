import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/sales");
    
    const allBookings = res.data.flatMap(sale => 
      (sale.FullDetails || []).map(item => ({
        ...item,
        // Ensure we keep the customer name from the parent sale
        customerName: sale.CustomerName || "Walk-in" 
      }))
    ).filter(item => item.bookingId); // Only show items that have a booking ID

    setAppointments(allBookings);
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};

const handleCancel = async (bookingId) => {
  // Check the console: Does this match the ID in your MongoDB Compass?
  console.log("Attempting to cancel:", bookingId); 

  if (!bookingId) return alert("Missing Booking ID");

  if (window.confirm("Confirm cancellation? This will free up the staff and room.")) {
    try {
      const res = await axios.delete(`http://localhost:5000/api/appointments/${bookingId}`);
      if (res.data.success) {
        // Refresh the list immediately
        fetchAppointments(); 
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Could not cancel"));
    }
  }
};

  const filtered = appointments.filter(app => 
    app.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin: Appointment Schedule</h1>
        <input 
          type="text" 
          placeholder="Search client or service..." 
          style={styles.searchBar}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={styles.list}>
        {filtered.length === 0 ? (
          <p style={styles.emptyMsg}>No upcoming appointments.</p>
        ) : (
          filtered.map((app, index) => {
            const dateObj = new Date(app.StartTime);
            return (
              <div key={index} style={styles.card}>
                <div style={styles.cardBody}>
                  <div style={styles.timeBox}>
                    <span style={styles.dateText}>{dateObj.toLocaleDateString()}</span>
                    <span style={styles.timeText}>{dateObj.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                  
                  <div style={styles.infoBox}>
                    <h3 style={styles.serviceName}>{app.Name}</h3>
                    <p style={styles.clientName}>Client: <strong>{app.customerName}</strong></p>
                    <div style={styles.tags}>
                      <span style={styles.tag}>👤 Staff: {app.StaffIDs}</span>
                      <span style={styles.tag}>🚪 Room: {app.RoomIDs}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleCancel(app.bookingId)} style={styles.cancelBtn}>
                  Cancel Booking
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", maxWidth: "900px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { fontSize: "24px", fontWeight: "900" },
  searchBar: { padding: "12px", borderRadius: "10px", border: "1px solid #ddd", width: "250px" },
  list: { display: "flex", flexDirection: "column", gap: "15px" },
  card: { background: "#fff", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #f1f5f9" },
  cardBody: { display: "flex", gap: "25px", alignItems: "center" },
  timeBox: { display: "flex", flexDirection: "column", background: "#f8fafc", padding: "10px 15px", borderRadius: "12px", textAlign: "center", minWidth: "100px" },
  dateText: { fontSize: "12px", color: "#64748b", fontWeight: "bold" },
  timeText: { fontSize: "16px", fontWeight: "900", color: "#0f172a" },
  serviceName: { margin: "0 0 5px 0", fontSize: "18px", color: "#1e293b" },
  clientName: { margin: 0, fontSize: "14px", color: "#64748b" },
  tags: { display: "flex", gap: "10px", marginTop: "10px" },
  tag: { fontSize: "11px", background: "#eff6ff", color: "#3b82f6", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" },
  cancelBtn: { background: "#fee2e2", color: "#ef4444", border: "none", padding: "10px 15px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" },
  emptyMsg: { textAlign: "center", color: "#94a3b8", padding: "50px" }
};