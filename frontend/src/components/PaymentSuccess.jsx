import React from "react";

export default function PaymentSuccess({ details, onDone }) {
  // 1. Safety check: If details is empty, show nothing
  if (!details) return null;

  // 2. Map the data structure sent from Cart.jsx
  // We check for both casing (FullDetails vs cart) to ensure it never breaks
  const items = details.FullDetails || details.cart || [];
  const finalTotal = details.Total || details.total || 0;

  return (
    <div 
      style={{ padding: "40px", textAlign: "center", maxWidth: "500px", margin: "0 auto" }} 
      className="animate-in fade-in duration-500"
    >
      {/* Success Icon */}
      <div style={{ fontSize: "60px", color: "#10b981", marginBottom: "10px" }}>✓</div>
      <h2 style={{ fontWeight: "900", fontSize: "32px", color: "#000", marginBottom: "5px" }}>Order Paid</h2>
      <p style={{ color: "#64748b", marginBottom: "30px" }}>Thank you for your purchase!</p>

      {/* Receipt Details Container */}
      <div style={{ borderTop: "2px dashed #e2e8f0", borderBottom: "2px dashed #e2e8f0", margin: "20px 0", paddingTop: "20px", paddingBottom: "10px" }}>
        {items.map((item, i) => {
          // Handle both 'name' and 'Name' casing
          const displayName = item.name || item.Name;
          const displayPrice = item.price || item.Price;
          const displayQty = item.quantity || 1;
          const isService = !!item.time || !!item.StartTime;

          return (
            <div key={i} style={{ marginBottom: "20px" }}>
              {/* Main Item Line */}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#000", fontWeight: "bold" }}>
                <span>{displayName} {displayQty > 1 ? `x${displayQty}` : ''}</span>
                <span>${(Number(displayPrice) * displayQty).toFixed(2)}</span>
              </div>

              {/* Service Specific Details (Time, Staff, Room) */}
              {isService && (
                <div style={{ 
                  textAlign: "left", 
                  fontSize: "12px", 
                  color: "#64748b", 
                  background: "#f8fafc", 
                  padding: "8px", 
                  borderRadius: "8px",
                  marginTop: "5px" 
                }}>
                  <div>
      📅 <strong>Date:</strong> {item.dateLabel || (item.StartTime ? new Date(item.StartTime).toLocaleDateString() : "N/A")}
    </div>
                  <div>🕒 <strong>Time:</strong> {item.time || item.timeLabel || "Scheduled"}</div>
                  <div>👤 <strong>Staff:</strong> {item.staff || item.StaffIDs || "General"}</div>
                  <div>🚪 <strong>Room:</strong> {item.room || item.RoomIDs || "N/A"}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Amount */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
        <span style={{ fontSize: "18px", color: "#64748b" }}>Total Amount:</span>
        <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#000", margin: 0 }}>
          ${Number(finalTotal).toFixed(2)}
        </h3>
      </div>

      {/* Action Button */}
      <button 
        onClick={onDone}
        style={{ 
          marginTop: "40px", 
          width: "100%",
          padding: "18px", 
          background: "#000", 
          color: "#fff", 
          border: "none", 
          borderRadius: "15px", 
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          transition: "background 0.2s"
        }}
        onMouseOver={(e) => e.target.style.background = "#db2777"} 
        onMouseOut={(e) => e.target.style.background = "#000"}
      >
        Done & Go Home
      </button>
    </div>
  );
}