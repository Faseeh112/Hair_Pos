// import React, { useState } from "react";
// import axios from "axios";
// import { UI } from "../constants/theme";

// export default function Chat() {
//   const [chat, setChat] = useState({ open: false, input: "", msgs: [] });

//   const handleChat = async () => {
//     if (!chat.input.trim()) return;
//     const userMsg = { role: "user", text: chat.input };
    
//     setChat(s => ({
//       ...s,
//       input: "",
//       msgs: [...s.msgs, userMsg, { role: "ai", text: "Checking stock..." }]
//     }));

//     try {
//       const res = await axios.post("http://localhost:5000/api/ai_chat", { message: chat.input });
//       setChat(s => {
//         const updated = [...s.msgs];
//         updated[updated.length - 1] = { role: "ai", text: res.data.answer };
//         return { ...s, msgs: updated };
//       });
//     } catch (err) {
//       console.error("Chat Error:", err);
//     }
//   };

//   return (
//     <>
//       <button 
//         style={styles.chatFab} 
//         onClick={() => setChat(s => ({ ...s, open: !s.open }))}
//       >
//         💬
//       </button>
      
//       {chat.open && (
//         <div style={styles.chatWin}>
//           <div style={styles.chatHead}>Inventory Sales Assistant</div>
//           <div style={styles.chatBody}>
//             {chat.msgs.map((m, i) => (
//               <div key={i} style={m.role === "user" ? styles.userB : styles.aiB}>
//                 <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{m.text}</pre>
//               </div>
//             ))}
//           </div>
//           <div style={styles.chatInputRow}>
//             <input 
//               style={styles.input} 
//               value={chat.input} 
//               onChange={e => setChat(s => ({ ...s, input: e.target.value }))} 
//               onKeyDown={e => e.key === "Enter" && handleChat()} 
//               placeholder="Ask anything..." 
//             />
//             <button style={styles.send} onClick={handleChat}>Ask</button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// const styles = {
//   chatFab: { display: "flex", 
//   alignItems: "center",
//   justifyContent: "center",position: "fixed", bottom: "40px", right: "40px", width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#0284c7", color: "#fff", border: "none", cursor: "pointer", fontSize: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 100 },
//   chatWin: { position: "fixed", bottom: "120px", right: "40px", width: "400px", height: "600px", backgroundColor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", border: `1px solid ${UI.border}`, zIndex: 100 },
//   chatHead: { background: UI.sidebar, color: UI.accent, padding: "20px", fontWeight: "bold" },
//   chatBody: { flex: 1, padding: "20px", overflowY: "auto", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "10px" },
//   userB: { alignSelf: "flex-end", background: "#0284c7", color: "#fff", padding: "12px 16px", borderRadius: "15px 15px 0 15px", maxWidth: "80%" },
//   aiB: { alignSelf: "flex-start", background: "#fff", padding: "12px 16px", borderRadius: "15px 15px 15px 0", maxWidth: "80%", border: `1px solid ${UI.border}`, color: "#000",},
//   chatInputRow: { padding: "15px", borderTop: `1px solid ${UI.border}`, display: "flex", gap: "10px" },
//   input: { flex: 1, padding: "12px", borderRadius: "10px", border: `1px solid ${UI.border}` },
//   send: { background: UI.sidebar, color: "#fff", border: "none", padding: "0 20px", borderRadius: "10px", cursor: "pointer" }
// };
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { UI } from "../constants/theme";

export default function Chat() {
  const [chat, setChat] = useState({ open: false, input: "", msgs: [] });
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chat.open) scrollToBottom();
  }, [chat.msgs, chat.open]);

  const handleChat = async () => {
    if (!chat.input.trim()) return;
    const userMsg = { role: "user", text: chat.input };
    
    setChat(s => ({
      ...s,
      input: "",
      msgs: [...s.msgs, userMsg, { role: "ai", text: "Thinking..." }]
    }));

    try {
      const res = await axios.post("http://localhost:5000/api/ai_chat", { message: chat.input });
      setChat(s => {
        const updated = [...s.msgs];
        updated[updated.length - 1] = { role: "ai", text: res.data.answer };
        return { ...s, msgs: updated };
      });
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  return (
    <>
      <button 
        style={styles.chatFab} 
        onClick={() => setChat(s => ({ ...s, open: !s.open }))}
      >
        {chat.open ? "✕" : "💬"}
      </button>
      
      {chat.open && (
        <div style={styles.chatWin}>
          <div style={styles.chatHead}>Inventory Sales Assistant</div>
          <div style={styles.chatBody}>
            {chat.msgs.map((m, i) => (
              <div key={i} style={m.role === "user" ? styles.userB : styles.aiB}>
                <pre style={styles.messageText}>{m.text}</pre>
              </div>
            ))}
            {/* Invisible element to anchor the scroll */}
            <div ref={messagesEndRef} />
          </div>
          <div style={styles.chatInputRow}>
            <input 
              style={styles.input} 
              value={chat.input} 
              onChange={e => setChat(s => ({ ...s, input: e.target.value }))} 
              onKeyDown={e => e.key === "Enter" && handleChat()} 
              placeholder="Ask anything..." 
            />
            <button style={styles.send} onClick={handleChat}>Ask</button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  chatFab: { 
    display: "flex", 
    alignItems: "center",
    justifyContent: "center",
    position: "fixed", 
    bottom: "clamp(20px, 5vh, 40px)", // Dynamic positioning
    right: "clamp(20px, 5vw, 40px)", 
    width: "60px", 
    height: "60px", 
    borderRadius: "50%", 
    backgroundColor: "#0284c7", 
    color: "#fff", 
    border: "none", 
    cursor: "pointer", 
    fontSize: "24px", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)", 
    zIndex: 1000,
    transition: "transform 0.2s ease"
  },
  chatWin: { 
    position: "fixed", 
    bottom: "clamp(90px, 12vh, 120px)", 
    right: "clamp(10px, 5vw, 40px)", 
    width: "min(400px, 90vw)", // Auto-adjusts for mobile screens
    height: "min(600px, 70vh)", // Auto-adjusts for short screens
    backgroundColor: "#fff", 
    borderRadius: "20px", 
    boxShadow: "0 25px 50px rgba(0,0,0,0.2)", 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden", 
    border: `1px solid ${UI.border}`, 
    zIndex: 1000 
  },
  chatHead: { 
    background: UI.sidebar, 
    color: UI.accent, 
    padding: "16px 20px", 
    fontWeight: "bold",
    fontSize: "15px"
  },
  chatBody: { 
    flex: 1, 
    padding: "15px", 
    overflowY: "auto", 
    background: "#f8fafc", 
    display: "flex", 
    flexDirection: "column", 
    gap: "12px",
    scrollBehavior: "smooth"
  },
  messageText: { 
    margin: 0, 
    whiteSpace: "pre-wrap", 
    fontFamily: "inherit", 
    fontSize: "14px",
    lineHeight: "1.4"
  },
  userB: { 
    alignSelf: "flex-end", 
    background: "#0284c7", 
    color: "#fff", 
    padding: "10px 14px", 
    borderRadius: "18px 18px 2px 18px", 
    maxWidth: "85%",
    boxShadow: "0 2px 5px rgba(2, 132, 199, 0.2)"
  },
  aiB: { 
    alignSelf: "flex-start", 
    background: "#fff", 
    padding: "10px 14px", 
    borderRadius: "18px 18px 18px 2px", 
    maxWidth: "85%", 
    border: `1px solid ${UI.border}`, 
    color: "#1e293b",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)"
  },
  chatInputRow: { 
    padding: "12px", 
    borderTop: `1px solid ${UI.border}`, 
    display: "flex", 
    gap: "8px",
    backgroundColor: "#fff"
  },
  input: { 
    flex: 1, 
    padding: "10px 15px", 
    borderRadius: "20px", 
    border: `1px solid ${UI.border}`,
    outline: "none",
    fontSize: "14px"
  },
  send: { 
    background: "#0284c7", 
    color: "#fff", 
    border: "none", 
    padding: "0 18px", 
    borderRadius: "20px", 
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px"
  }
};