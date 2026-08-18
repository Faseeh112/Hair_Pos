import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SlotSelector({ item, onConfirm, onCancel }) {
  const [sales, setSales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Fetch all sales to check against existing appointments
    axios.get("http://localhost:5000/api/sales").then(res => setSales(res.data));
  }, []);

  // Generate slots every 15 mins (9 AM to 6 PM)
  const timeSlots = [];
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  // --- FIXED ASSIGNMENT LOGIC ---
  const getAssignment = (slotTime) => {
    const slotStart = new Date(`${selectedDate}T${slotTime}`);
    const serviceDuration = parseInt(item.Duration) || 30; 
    const breakTime = 10; // 10 minutes buffer requested
    
    // The time this specific service would end
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
    // The time including the mandatory buffer for the NEXT appointment
    const slotEndWithBuffer = new Date(slotEnd.getTime() + breakTime * 60000);

    // 1. Get lists of Staff and Rooms allowed for this service
    const potentialStaff = item.StaffIDs ? item.StaffIDs.split(',').map(s => s.trim()) : [];
    const potentialRooms = item.RoomIDs ? item.RoomIDs.split(',').map(r => r.trim()) : [];

    // 2. Filter potential resources by checking their schedules
    // We find a staff member who is NOT busy during (slotStart to slotEndWithBuffer)
    const availableStaff = potentialStaff.find(staffId => {
      const isBusy = sales.some(sale => (sale.FullDetails || []).some(booking => {
        const bStart = new Date(booking.StartTime);
        const bEnd = new Date(booking.EndTime);
        // Include the 10min buffer check: 
        // A slot is busy if it starts before a previous appointment's buffer ends
        const bEndWithBuffer = new Date(bEnd.getTime() + breakTime * 60000);
        
        const timeOverlap = (slotStart < bEndWithBuffer && slotEndWithBuffer > bStart);
        return timeOverlap && booking.StaffIDs === staffId;
      }));
      return !isBusy;
    });

    // We find a room that is NOT busy
    const availableRoom = potentialRooms.find(roomId => {
      const isBusy = sales.some(sale => (sale.FullDetails || []).some(booking => {
        const bStart = new Date(booking.StartTime);
        const bEnd = new Date(booking.EndTime);
        const bEndWithBuffer = new Date(bEnd.getTime() + breakTime * 60000);

        const timeOverlap = (slotStart < bEndWithBuffer && slotEndWithBuffer > bStart);
        return timeOverlap && booking.RoomIDs === roomId;
      }));
      return !isBusy;
    });

    return {
      isAvailable: !!(availableStaff && availableRoom),
      staff: availableStaff,
      room: availableRoom
    };
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>Book {item.Name}</h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Duration: {item.Duration} mins (+ 10m buffer)</p>
          </div>
          <button onClick={onCancel} style={styles.closeBtn}>✕ Close</button>
        </div>

        <div style={{ marginBottom: "25px", display: "flex", gap: "15px", alignItems: "center", background: "#f8fafc", padding: "15px", borderRadius: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Appointment Date:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            style={styles.dateInput}
          />
        </div>

        <div style={styles.slotGrid}>
          {timeSlots.map(slot => {
            const assignment = getAssignment(slot);
            return (
              <button
                key={slot}
                disabled={!assignment.isAvailable}
                onClick={() => onConfirm({
                  ...item,
                  StaffIDs: assignment.staff, 
                  RoomIDs: assignment.room    
                }, `${selectedDate}T${slot}`)}
                style={{
                  ...styles.slotBtn,
                  backgroundColor: assignment.isAvailable ? "#f0fdf4" : "#fee2e2",
                  border: assignment.isAvailable ? "1px solid #bbf7d0" : "1px solid #fecaca",
                  color: assignment.isAvailable ? "#166534" : "#991b1b",
                  cursor: assignment.isAvailable ? "pointer" : "not-allowed",
                  opacity: assignment.isAvailable ? 1 : 0.7
                }}
              >
                <strong style={{ fontSize: "16px" }}>{slot}</strong>
                <span style={{ fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {assignment.isAvailable ? `Staff: ${assignment.staff}` : "Busy / Buffer"}
                </span>
                {assignment.isAvailable && (
                  <span style={{ fontSize: '9px', opacity: 0.8 }}>Room: {assignment.room}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "#fff", width: "95%", maxWidth: "800px", maxHeight: "90vh", borderRadius: "30px", padding: "40px", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" },
  dateInput: { padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px", outline: "none", cursor: "pointer" },
  slotGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" },
  slotBtn: { padding: "18px 10px", border: "none", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", transition: "all 0.2s ease" },
  closeBtn: { background: "#f1f5f9", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }
};