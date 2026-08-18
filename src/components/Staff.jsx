import React from "react";
import axios from "axios";
import { UI } from "../constants/theme";

export default function Staff({ staff, onRefresh, onAddNew }) {
  
  // Triggers the native browser date picker
  const triggerCalendar = async (member, type) => {
    const inputId = `${type}-${member.StaffID}`;
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.showPicker(); 
    }
  };

  const handleDateChange = async (member, field, value) => {
    if (!value) return;
    try {
      // Send the specific staff member's data + the new date
      await axios.post("http://localhost:5000/api/staff", {
        ...member,
        [field]: value
      });
      onRefresh();
    } catch (err) {
      alert("Error saving date");
    }
  };

  const clearLeave = async (member) => {
    try {
      await axios.post("http://localhost:5000/api/staff", {
        ...member,
        LeaveStart: null,
        LeaveEnd: null
      });
      onRefresh();
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={{ margin: 0, color: "#000", fontWeight: "900" }}>Team Management</h2>
      </div>

      <div style={styles.grid}>
        {staff.map((member) => (
          <div key={member.StaffID} style={styles.card}>
            {/* ID Badge */}
            <div style={styles.badge}>ID: {member.StaffID}</div>
            
            {/* Staff Name - Fixed to display clearly */}
            <h3 style={styles.name}>{member.Name || "Unnamed Staff"}</h3>
            
            {/* Availability Status */}
            <div style={styles.statusSection}>
              <span style={styles.label}>CURRENT STATUS</span>
              {member.LeaveStart ? (
                <div style={styles.absentBox}>
                  <p style={styles.absentText}>
                    📅 On Leave: {member.LeaveStart}
                  </p>
                  <p style={{fontSize: "11px", color: "#ef4444"}}>Until: {member.LeaveEnd || "TBD"}</p>
                  <button 
                    onClick={() => clearLeave(member)}
                    style={styles.clearBtn}
                  >
                    Set as Available
                  </button>
                </div>
              ) : (
                <p style={styles.availableText}>● Active & Available</p>
              )}
            </div>

            {/* Date Selection Row */}
            <div style={styles.actions}>
              <div style={{ flex: 1, position: 'relative' }}>
                <button onClick={() => triggerCalendar(member, 'LeaveStart')} style={styles.leaveBtn}>
                   Set Start Leave
                </button>
                <input 
                  id={`LeaveStart-${member.StaffID}`}
                  type="date" 
                  style={styles.hiddenInput} 
                  onChange={(e) => handleDateChange(member, 'LeaveStart', e.target.value)}
                />
              </div>

              <div style={{ flex: 1, position: 'relative' }}>
                <button onClick={() => triggerCalendar(member, 'LeaveEnd')} style={styles.leaveBtn}>
                   Set End Leave
                </button>
                <input 
                  id={`LeaveEnd-${member.StaffID}`}
                  type="date" 
                  style={styles.hiddenInput} 
                  onChange={(e) => handleDateChange(member, 'LeaveEnd', e.target.value)}
                />
              </div>
            </div>
            
            {/* Remove Action */}
            <button 
              onClick={() => { if(window.confirm(`Remove ${member.Name}?`)) axios.delete(`http://localhost:5000/api/staff/${member.StaffID}`).then(onRefresh)}} 
              style={styles.deleteBtnFull}
            >
              Remove Staff Member
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  addBtn: { padding: "12px 24px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
  
  card: { 
    background: "#fff", 
    padding: "30px", 
    borderRadius: "24px", 
    border: `1px solid ${UI.border}`, 
    position: "relative", 
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: "320px"
  },
  
  badge: { position: "absolute", top: "15px", right: "15px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", color: "#64748b", fontWeight: "bold" },
  
  name: { 
    fontSize: "24px", 
    marginBottom: "10px", 
    color: "#000000", // Forced Black for visibility
    fontWeight: "900",
    textTransform: "capitalize" 
  },
  
  statusSection: { marginBottom: "20px", padding: "15px", background: "#f8fafc", borderRadius: "15px", flexGrow: 1 },
  label: { fontSize: "10px", fontWeight: "bold", color: "#94a3b8", display: "block", marginBottom: "8px", letterSpacing: "1px" },
  availableText: { color: "#10b981", fontWeight: "800", margin: 0 },
  absentText: { color: "#ef4444", fontWeight: "800", margin: 0, fontSize: "14px" },
  
  clearBtn: { background: "#10b981", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", marginTop: "12px", fontSize: "11px", fontWeight: "bold" },
  
  actions: { display: "flex", gap: "10px", marginBottom: "10px" },
  leaveBtn: { width: "100%", padding: "10px", background: "#f0f9ff", color: "#0284c7", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  
  hiddenInput: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, pointerEvents: "none" },
  
  deleteBtnFull: { width: "100%", padding: "12px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", marginTop: "10px", fontSize: "12px" },
  
  addNewCard: { 
    border: `2px dashed ${UI.border}`, 
    borderRadius: "24px", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer",
    minHeight: "320px",
    opacity: 0.6,
    transition: "0.2s"
  }
};