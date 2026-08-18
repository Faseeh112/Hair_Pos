import EditItemPage from "./components/EditItemPage"; // Make sure the filename matches exactly
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import AddProductPage from "./components/AddProductPage";
import AddServicePage from "./components/AddServicePage";
import AddStaffPage from "./components/AddStaffPage";
import SlotSelector from "./components/SlotSelector";
import Sales from "./components/Sales";
import Appointments from "./components/Appointments";
import Chat from "./components/Chat";
import Staff from "./components/Staff";
import Login from "./components/Login";

export default function App() {
  const [page, setPage] = useState("home"); 
  const [bookingItem, setBookingItem] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [data, setData] = useState({ products: [], services: [], staff: [] });
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  const isAdmin = user?.role === "admin";

  // --- 1. DATA FETCHING ---
  const fetchData = () => {
    axios.get("http://localhost:5000/api/products").then(res => setData(s => ({ ...s, products: res.data })));
    axios.get("http://localhost:5000/api/services").then(res => setData(s => ({ ...s, services: res.data })));
    if (user) {
      axios.get("http://localhost:5000/api/staff").then(res => setData(s => ({ ...s, staff: res.data })));
    }
  };

  useEffect(() => {
    fetchData();
    if (user) setShowAuth(false);
  }, [user]);

  // --- 2. RESTORED: ALL ORIGINAL LOGIC FUNCTIONS ---
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  // Add these to your state list in App.jsx
const [editingItem, setEditingItem] = useState(null);
const [editType, setEditType] = useState(""); // "products" or "services"

// Create a handler function
const handleEditClick = (item, type) => {
    setEditingItem(item);
    setEditType(type);
    setPage("edit-page");
};
const handlePayment = async () => {
  if (cart.length === 0) return;

  const saleData = {
    Date: new Date().toISOString(),
    Total: discountedTotal,
    // This is the important part:
    // It maps every item, including the StartTime/EndTime for services
    FullDetails: cart.map(item => ({
      Name: item.Name,
      Price: item.Price,
      quantity: item.quantity,
      StartTime: item.StartTime || null, // Included for Slot Selector
      EndTime: item.EndTime || null,     // Included for Slot Selector
      bookingId: item.bookingId || null,
      StaffIDs: item.StaffIDs || ""
    })),
    Items: cart.map(i => i.Name)
  };

  try {
    await axios.post("http://localhost:5000/api/sales", saleData);
    setPaymentDetails({ cart, total: discountedTotal, discount });
    setCart([]); // Clear cart after success
  } catch (err) {
    alert("Payment failed to save to sales.");
  }
};
  const handleAdminCreateAccount = async () => {
    if (!isAdmin) return;
    const username = prompt("Create Login Username:");
    const password = prompt("Create Login Password:");
    const role = prompt("Assign Role (admin/user):", "user");
    if (username && password && role) {
      try {
        await axios.post("http://localhost:5000/api/admin/create-account", { username, password, role });
        alert(`Account for ${username} created!`);
      } catch (err) { alert("Error creating login."); }
    }
  };

  const handleRestock = async (item) => {
    const amount = prompt(`Add stock for ${item.Name}:`);
    if (amount && !isNaN(amount)) {
      try {
        await axios.post("http://localhost:5000/api/restock", { Name: item.Name, Amount: parseInt(amount) });
        fetchData();
      } catch (err) { alert("Error updating stock."); }
    }
  };

  const handleDelete = async (item, type) => {
    if (window.confirm(`Delete "${item.Name}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/${type}/${item.Name}`);
        fetchData();
      } catch (err) { alert("Error deleting item."); }
    }
  };
const handleAddNew = () => {
    if (page === "products") setPage("add-product");
    else if (page === "services") setPage("add-service");
    else if (page === "staff") setPage("add-staff"); // Redirect to the new page
};
const handleAddToCart = (item, qty = 1) => {
  // 1. Check if user is logged in
  if (!user) { 
    setShowAuth(true); 
    return; 
  }
  
  // 2. If it's a SERVICE, open the Time Slot Modal
  if (page === "services" || item.Duration) {
    setBookingItem(item); 
    return; // Stop here, the SlotSelector will handle the rest
  }

  // 3. If it's a PRODUCT, run Stock Check and Cart Logic
  const existing = cart.find(c => c.Name === item.Name);
  const currentCartQty = existing ? existing.quantity : 0;
  const newQty = currentCartQty + Number(qty);

  // Stock Validation
  if (item.Stock !== undefined && newQty > item.Stock) {
    alert(`Out of Stock! Only ${item.Stock} units available. (You have ${currentCartQty} in cart)`);
    return;
  }

  // Update Cart state
  if (existing) {
    setCart(cart.map(c => 
      c.Name === item.Name ? { ...c, quantity: newQty } : c
    ));
  } else {
    setCart([...cart, { ...item, quantity: newQty }]);
  }
};
const handleEditPhoto = async (item) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      try {
        // 1. Changed to .put
        // 2. Added the item name to the URL
        await axios.put(`http://localhost:5000/api/products/${encodeURIComponent(item.Name)}`, { 
          ...item, 
          Image: base64 
        });
        
        alert("Photo updated!");
        fetchData(); // Refresh the list to show the new image
      } catch (err) {
        console.error(err);
        alert("Update failed. Check if the backend route exists.");
      }
    }
  };
  fileInput.click();
};
const Footer = () => {
  return (
    <footer className="bg-[#131921] text-white pt-12 pb-6 mt-20">
      <div className="container mx-auto px-8">
        {/* Upper Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-sm border-b border-gray-700 pb-12">
          <div>
            <h4 className="font-bold mb-4">Get to Know Us</h4>
            <ul className="space-y-2 text-gray-400 text-xs">
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Blog</li>
              <li className="hover:underline cursor-pointer">About HairPOS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Make Money with Us</h4>
            <ul className="space-y-2 text-gray-400 text-xs">
              <li className="hover:underline cursor-pointer">Sell products</li>
              <li className="hover:underline cursor-pointer">Become an Affiliate</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Payment Products</h4>
            <ul className="space-y-2 text-gray-400 text-xs">
              <li className="hover:underline cursor-pointer">Business Card</li>
              <li className="hover:underline cursor-pointer">Shop with Points</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Let Us Help You</h4>
            <ul className="space-y-2 text-gray-400 text-xs">
              <li className="hover:underline cursor-pointer">Your Account</li>
              <li className="hover:underline cursor-pointer">Shipping Rates</li>
              <li className="hover:underline cursor-pointer">Help</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="text-center text-[10px] text-gray-500 space-y-2">
          <div className="flex justify-center gap-6 mb-4">
            <span className="hover:underline cursor-pointer">Conditions of Use</span>
            <span className="hover:underline cursor-pointer">Privacy Notice</span>
            <span className="hover:underline cursor-pointer">Consumer Health Data</span>
          </div>
          <p>© 1996-2026, HairPOS, Inc. or its affiliates</p>
        </div>
      </div>
    </footer>
  );
};
return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-sans overflow-x-hidden flex flex-col">
      
      {/* 3. PREMIUM NAV BAR */}
      <header className="fixed top-0 w-full z-[70] bg-white/70 backdrop-blur-2xl border-b border-gray-100">
        <div className="container mx-auto px-8 py-5 flex items-center justify-between">
          <div className="text-3xl font-serif font-black italic tracking-tighter cursor-pointer" onClick={() => setPage("home")}>
            HAIR<span className="text-pink-600 not-italic">POS</span>
          </div>

          <nav className="hidden lg:flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em]">
            <button onClick={() => setPage("home")} className={page === "home" ? "text-pink-600" : "hover:text-pink-600"}>Home</button>
            <button onClick={() => setPage("products")} className={page === "products" ? "text-pink-600" : "hover:text-pink-600"}>Shop</button>
            <button onClick={() => setPage("services")} className={page === "services" ? "text-pink-600" : "hover:text-pink-600"}>Services</button>
            
            {isAdmin && (
              <>
                <button onClick={() => setPage("staff")} className={page === "staff" ? "text-pink-600" : "text-gray-400 hover:text-black"}>Staff</button>
                <button onClick={() => setPage("sales")} className={page === "sales" ? "text-pink-600" : "text-gray-400 hover:text-black"}>Sales</button>
                <button onClick={() => setPage("appointments")} className={page === "appointments" ? "text-pink-600" : "text-gray-400 hover:text-black"}>Bookings</button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-6">
            {!user ? (
              <button onClick={() => setShowAuth(true)} className="bg-black text-white px-7 py-3 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-pink-600 transition-all">Login</button>
            ) : (
              <div className="flex items-center gap-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{user.username}</span>
                <button onClick={() => { setUser(null); setPage("home"); }} className="text-[10px] font-bold uppercase underline underline-offset-8">Logout</button>
                <button onClick={() => setPage("cart")} className="relative text-2xl">👜 
                  {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 flex-grow">
        {page === "home" ? (
          <div className="animate-in fade-in duration-1000">
            {/* HERO SECTION */}
            <section className="relative h-[90vh] flex items-center justify-center bg-black overflow-hidden">
              <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Hero" />
              <div className="relative text-center text-white z-10 px-4">
                <h1 className="text-[12vw] font-serif italic leading-[0.8] mb-10 tracking-tighter">Pure<br/>Elegance.</h1>
                <p className="text-[10px] uppercase tracking-[1.2em] mb-12 opacity-60">The Standard of Botanical Haircare</p>
                <button onClick={() => setPage("products")} className="bg-white text-black px-14 py-5 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-pink-600 hover:text-white transition-all">Shop Collection</button>
              </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="py-32 bg-white">
              <div className="container mx-auto px-8 grid md:grid-cols-3 gap-12">
                <div className="p-12 rounded-[3rem] bg-[#fbfbf9] hover:bg-black group transition-all duration-700">
                  <div className="text-6xl mb-8">✨</div>
                  <h3 className="text-3xl font-serif italic mb-4 group-hover:text-white">Radiance</h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-500">Molecular repair for instant hair shine.</p>
                </div>
                <div className="p-12 rounded-[3rem] bg-[#fbfbf9] hover:bg-black group transition-all duration-700">
                  <div className="text-6xl mb-8">🌿</div>
                  <h3 className="text-3xl font-serif italic mb-4 group-hover:text-white">Organic</h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-500">100% cold-pressed plant essences.</p>
                </div>
                <div className="p-12 rounded-[3rem] bg-[#fbfbf9] hover:bg-black group transition-all duration-700">
                  <div className="text-6xl mb-8">🛡️</div>
                  <h3 className="text-3xl font-serif italic mb-4 group-hover:text-white">Defense</h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-500">Shielding against environmental damage.</p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* INTERNAL PAGES */
          <div className="container mx-auto px-8 py-20 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-16 border-b border-gray-100 pb-12">
              <div>
                <p className="text-pink-600 text-[10px] font-bold uppercase tracking-[0.5em] mb-4">Management</p>
                <h2 className="text-7xl font-serif capitalize tracking-tighter">
                    {page === "edit-page" ? `Edit ${editType.slice(0, -1)}` : page.replace("-", " ")}
                </h2>
              </div>
              
              {/* DYNAMIC ADMIN ACTIONS */}
              {isAdmin && (page === "products" || page === "services" || page === "staff") && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                        if(page === "products") setPage("add-product");
                        else if(page === "services") setPage("add-service");
                        else if(page === "staff") setPage("add-staff");
                    }} 
                    className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-pink-600 transition-all"
                  >
                    + Add {page}
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-[600px]">
              {/* --- EDIT PAGE --- */}
              {page === "edit-page" && (
                <EditItemPage 
                  item={editingItem} 
                  type={editType} 
                  onSuccess={() => { fetchData(); setPage(editType); }} 
                  onCancel={() => setPage(editType)} 
                />
              )}

              {/* --- ADD PAGES --- */}
              {page === "add-product" && <AddProductPage onSuccess={() => { fetchData(); setPage("products"); }} onCancel={() => setPage("products")} />}
              {page === "add-service" && <AddServicePage onSuccess={() => { fetchData(); setPage("services"); }} onCancel={() => setPage("services")} />}
              {page === "add-staff" && <AddStaffPage onSuccess={() => { fetchData(); setPage("staff"); }} onCancel={() => setPage("staff")} />}

              {/* --- DATA PAGES --- */}
              {page === "staff" && <Staff staff={data.staff} onRefresh={fetchData} />}
              {page === "appointments" && <Appointments />}
              {page === "sales" && <Sales />}
              
              {(page === "products" || page === "services") && (
                <ProductGrid 
                  type={page} 
                  items={data[page]} 
                  addToCart={handleAddToCart} 
                  isAdmin={isAdmin} 
                  onRestock={handleRestock} 
                  onDelete={(item) => handleDelete(item, page)}
                  onEditImage={handleEditPhoto}
                  onEdit={(item) => {
                    setEditingItem(item);
                    setEditType(page);
                    setPage("edit-page");
                  }} 
                />
              )}
              
              {/* Passing user prop to Cart for discount visibility control */}
              {page === "cart" && <Cart cart={cart} setCart={setCart} discount={discount} setDiscount={setDiscount} fetchData={fetchData} setPage={setPage} user={user}/>}
            </div>
          </div>
        )}
      </main>

      {/* FIXED FOOTER ON EVERY PAGE */}
      <Footer />

      {/* OVERLAYS */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-xl">
          <div className="relative w-full max-w-lg animate-in zoom-in duration-300 shadow-2xl">
            <button onClick={() => setShowAuth(false)} className="absolute -top-16 right-0 text-white text-5xl font-light hover:text-pink-600 transition-colors">✕</button>
            <Login onLogin={(userData) => setUser(userData)} />
          </div>
        </div>
      )}

      {bookingItem && (
        <SlotSelector 
          item={bookingItem} 
          onConfirm={(item, time) => {
            const duration = parseInt(item.Duration) || 30;
            const start = new Date(time);
            const end = new Date(start.getTime() + duration * 60000);
            setCart(prev => [...prev, { 
              ...item, 
              quantity: 1, 
              StartTime: start.toISOString(), 
              EndTime: end.toISOString(),
              timeLabel: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dateLabel: start.toLocaleDateString(),
              StaffIDs: item.StaffIDs,
              RoomIDs: item.RoomIDs,
              bookingId: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}` 
            }]);
            setBookingItem(null);
            // Automatic redirect to cart removed per request
          }} 
          onCancel={() => setBookingItem(null)}
        />
      )}

      {(user || page !== "home") && <Chat />}
    </div>
  );
}