import React, { useState } from "react";
import PaymentSuccess from "./PaymentSuccess"; 
import axios from "axios";

// Added 'user' prop to access login role
export default function Cart({ cart, setCart, discount, setDiscount, fetchData, setPage, user }) {
  const [viewState, setViewState] = useState("cart"); 
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Check if current user is admin
  const isAdmin = user?.role === "admin";

  // Calculate Totals
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.Price) * (item.quantity || 1)), 0);
  const discountedTotal = subtotal * (1 - (discount / 100));

  const handleIncrease = (item) => {
    setCart(prev => prev.map(i => i.Name === item.Name ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
  };

  const handleDecrease = (name) => {
    setCart(prev => prev.map(i => i.Name === name ? { ...i, quantity: Math.max(1, (i.quantity || 1) - 1) } : i));
  };

  const handleRemove = (name) => {
    setCart(prev => prev.filter(i => i.Name !== name));
  };

  const handlePayment = async () => {
  if (cart.length === 0) return;

  try {
    const payload = {
      items: cart, // Existing functionality
      total: discountedTotal, // Existing functionality
      // NEW: Send the logged-in user's name
      CustomerName: user ? user.username : "Guest" 
    };

    const res = await axios.post("http://localhost:5000/api/checkout", payload);
    
    if (res.status === 200) {
      setPaymentDetails({ ...payload, FullDetails: cart }); // For PaymentSuccess.jsx
      setViewState("success");
      setCart([]);
      
      // Refresh global data so SlotSelector and Appointments update immediately
      if (fetchData) fetchData(); 
    }
  } catch (err) {
    console.error("Payment Error:", err);
    alert("Payment Failed");
  }
};

  if (viewState === "success") {
    return (
      <PaymentSuccess 
        details={paymentDetails} 
        onDone={() => {
          setCart([]);      
          setDiscount(0);   
          setPage("home");  
        }} 
      />
    );
  }

  return (
    <div style={styles.centerWrapper} className="animate-in fade-in duration-500">
      <div style={styles.cartContainer}>
        <h2 style={styles.mainTitle}>Order Summary</h2>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Your cart is empty.</p>
            <button onClick={() => setPage("products")} style={styles.qtyBtn}>Go Shopping</button>
          </div>
        ) : (
          <>
            <div style={styles.scrollArea}>
              {cart.map((item, index) => {
                const isService = !!item.StartTime;
                return (
                  <div key={index} style={isService ? styles.serviceTicket : styles.cartItem}>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.itemTitle}>{item.Name}</h3>
                      {isService ? (
                        <div style={styles.transcriptGrid}>
                          <div style={styles.infoBox}><label style={styles.infoLabel}>TIME</label><div style={styles.infoVal}>{item.timeLabel || "Not Set"}</div></div>
                          <div style={styles.infoBox}><label style={styles.infoLabel}>STAFF</label><div style={styles.infoVal}>{item.StaffIDs || "General"}</div></div>
                          <div style={styles.infoBox}><label style={styles.infoLabel}>ROOM</label><div style={styles.infoVal}>{item.RoomIDs || "Any"}</div></div>
                        </div>
                      ) : (
                        <div style={styles.qtyContainer}>
                          <button style={styles.qtyBtn} onClick={() => handleDecrease(item.Name)}>-</button>
                          <span style={styles.qtyText}>{item.quantity || 1}</span>
                          <button style={styles.qtyBtn} onClick={() => handleIncrease(item)}>+</button>
                        </div>
                      )}
                    </div>
                    <div style={styles.rightColumn}>
                      <div style={styles.itemPriceText}>${(Number(item.Price) * (item.quantity || 1)).toFixed(2)}</div>
                      <button style={styles.removeBtn} onClick={() => handleRemove(item.Name)}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={styles.totalSection}>
              {/* RESTRICTION: Only Admin sees the discount input */}
              {isAdmin && (
                <div style={styles.inputRow}>
                  <label style={styles.infoLabel}>APPLY DISCOUNT (%)</label>
                  <input 
                    type="number" 
                    value={discount} 
                    onChange={(e) => setDiscount(Number(e.target.value))} 
                    style={styles.discountInput} 
                  />
                </div>
              )}
              
              <div style={styles.finalPriceRow}>
                <span>Total:</span>
                <span style={{color: "#10b981"}}>${discountedTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button style={styles.payBtn} onClick={handlePayment}>
              Complete Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
    centerWrapper: { display: "flex", justifyContent: "center", width: "100%", padding: "20px" },
    cartContainer: { backgroundColor: "#fff", padding: "40px", borderRadius: "30px", width: "100%", maxWidth: "600px", border: "1px solid #e2e8f0", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" },
    mainTitle: { textAlign: "center", marginBottom: "30px", fontWeight: "900", fontSize: "28px" },
    scrollArea: { maxHeight: "500px", overflowY: "auto" },
    cartItem: { display: "flex", justifyContent: "space-between", padding: "20px", background: "#f8fafc", borderRadius: "15px", marginBottom: "10px" },
    serviceTicket: { display: "flex", justifyContent: "space-between", padding: "20px", background: "#fff", border: "2px dashed #0284c7", borderRadius: "15px", marginBottom: "10px" },
    transcriptGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "10px" },
    itemTitle: { fontWeight: "800", fontSize: "18px" },
    qtyContainer: { display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" },
    qtyBtn: { width: "30px", height: "30px", borderRadius: "5px", border: "none", cursor: "pointer", background: "#000", color: "#fff" },
    qtyText: { fontWeight: "bold", color: "#000" },
    rightColumn: { textAlign: "right" },
    itemPriceText: { fontWeight: "900", fontSize: "20px", color: "#0284c7" },
    removeBtn: { background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "50%", cursor: "pointer", marginTop: "10px", width: "25px", height: "25px" },
    totalSection: { marginTop: "20px", borderTop: "2px solid #f1f5f9", paddingTop: "20px" },
    finalPriceRow: { display: "flex", justifyContent: "space-between", fontSize: "32px", fontWeight: "900" },
    payBtn: { width: "100%", padding: "20px", background: "#10b981", color: "#fff", borderRadius: "15px", border: "none", fontWeight: "bold", fontSize: "20px", cursor: "pointer", marginTop: "20px" },
    discountInput: { width: "80px", padding: "8px", textAlign: "center", borderRadius: "10px", border: "1px solid #e2e8f0" },
    inputRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
    infoBox: { background: "#f8fafc", padding: "8px", borderRadius: "10px" },
    infoLabel: { fontSize: "10px", color: "#94a3b8", display: "block", fontWeight: "bold", letterSpacing: "1px" },
    infoVal: { fontSize: "11px", fontWeight: "bold", color: "#000" }
};