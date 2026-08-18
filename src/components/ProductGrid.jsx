import React, { useState } from "react";

// Assuming UI is defined elsewhere or used as literal strings
const UI = {
  border: "#e2e8f0",
  sidebar: "#000000"
};

export default function ProductGrid({ type, items, addToCart, isAdmin, onRestock, onDelete, onEditImage, onEdit }) {
  const [quantities, setQuantities] = useState({});

  const handleQtyChange = (name, val) => {
    setQuantities(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div style={styles.gridContainer}>
      {items.map((item) => {
        const isLowStock = item.Stock <= 3;
        const outOfStock = item.Stock <= 0;
        const currentVal = quantities[item.Name] || (type === "services" ? "" : 1);

        return (
          <div 
            key={item.Name} 
            style={styles.productCard}
          >
            {/* ADMIN TOOLS */}
            {isAdmin && (
              <div style={styles.adminToolGroup}>
                <button style={styles.editIconBtn} onClick={() => onEdit(item)}>✏️</button>
                <button style={styles.deleteBtn} onClick={() => onDelete(item, type)}>×</button>
              </div>
            )}

            {/* IMAGE SECTION */}
            {type === "products" && (
              <div style={styles.imageContainer}>
                {item.Image ? (
                  <img src={item.Image} alt={item.Name} style={styles.productImage} />
                ) : (
                  <div style={styles.imagePlaceholder}>No Image</div>
                )}
                {isAdmin && (
                  <button onClick={() => onEditImage(item)} style={styles.editImageBtn}>📷 Edit Photo</button>
                )}
              </div>
            )}

            <div style={styles.contentWrapper}>
              <div style={styles.headerRow}>
                <h3 style={styles.productName}>{item.Name}</h3>
                {isAdmin && type === "products" && (
                  <button onClick={() => onRestock(item)} style={styles.restockBtn}>+ Restock</button>
                )}
              </div>
              
              <div style={styles.productPrice}>${item.Price}</div>
              
              {type === "products" && (
                <div style={{
                  ...styles.stockLabel,
                  color: outOfStock ? "#ef4444" : isLowStock ? "#f59e0b" : "#64748b"
                }}>
                  {outOfStock ? "Out of Stock" : `In Stock: ${item.Stock}`}
                </div>
              )}

              {type === "services" && (
                <div style={styles.detailsContainer}>
                  <div style={styles.detailItem}><span style={styles.detailLabel}>⏱ Duration:</span> {item.Duration || 30} mins</div>
                  <div style={styles.detailItem}><span style={styles.detailLabel}>👥 Staff:</span> {item.StaffIDs || "General"}</div>
                </div>
              )}
            </div>
            
            {!outOfStock && (
              <div style={styles.bulkRow}>
                {type === "products" && (
                  <input 
                    type="number" 
                    min="1" 
                    value={currentVal}
                    onChange={(e) => handleQtyChange(item.Name, Math.max(1, parseInt(e.target.value) || 1))}
                    style={styles.qtyInput}
                  />
                )}
                <button 
                  style={styles.addBtn} 
                  onClick={() => type === "services" ? addToCart(item, "open_selector") : addToCart(item, currentVal)}
                >
                  {type === "services" ? "📅 Book Slot" : "🛒 Add to Cart"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- KEEP THIS OUTSIDE THE FUNCTION ---
const styles = {
  gridContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px", width: "100%" },
  productCard: { position: "relative", backgroundColor: "#ffffff", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "380px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease" },
  adminToolGroup: { position: "absolute", top: "10px", right: "10px", display: "flex", gap: "8px", zIndex: 10 },
  editIconBtn: { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  deleteBtn: { backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" },
  imageContainer: { width: "100%", height: "150px", borderRadius: "12px", overflow: "hidden", position: "relative", backgroundColor: "#f1f5f9", marginBottom: "15px" },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  imagePlaceholder: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "14px", border: "1px dashed #cbd5e1", borderRadius: "12px" },
  editImageBtn: { position: "absolute", bottom: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "6px", fontSize: "10px", padding: "5px 10px", cursor: "pointer" },
  headerRow: { display: "flex", flexDirection: "column", gap: "5px" },
  productName: { color: "#000", fontSize: "18px", fontWeight: "600", margin: 0 },
  productPrice: { fontSize: "28px", fontWeight: "800", color: "#0284c7", marginTop: "5px" },
  stockLabel: { fontSize: "13px", fontWeight: "600", marginTop: "5px" },
  detailsContainer: { marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", background: "#f8fafc", padding: "10px", borderRadius: "12px" },
  detailItem: { fontSize: "12px", color: "#475569" },
  detailLabel: { fontWeight: "bold", color: "#64748b" },
  bulkRow: { display: "flex", gap: "10px", marginTop: "15px", alignItems: "center" },
  qtyInput: { width: "60px", padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" },
  addBtn: { flex: 1, padding: "12px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  restockBtn: { width: "fit-content", backgroundColor: "#f1f5f9", border: "none", color: "#64748b", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" },
  contentWrapper: { flex: 1 }
};