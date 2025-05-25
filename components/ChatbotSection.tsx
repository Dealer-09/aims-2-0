import React, { useState } from "react";
import styles from "../styles/Chatbot.module.css"; // ✅ Import Next.js CSS Module

const ChatbotSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState("");

  const responses: { [key: string]: string | (() => void) } = {
    hello: "Hello student, what can I help you with?",
    "who are you": "I am AskAIMS, your virtual assistant for AIMS (AMIT INSTITUTE OF MATH'S AND SCIENCE).",
    subjects: "Please tell me your interests or career goals, and I can suggest suitable subjects or courses.",
    contact: "📧 Email: aimsclasses07@gmail.com\n📞 Phone: 8777811841",
    "class timings": "Classes run from 9:00 AM to 5:00 PM (Monday to Friday).",
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, isUser: true }]);

    setTimeout(() => {
      const response = responses[input.toLowerCase()];
      let responseText: string;
      if (typeof response === "function") {
        responseText = "I don't understand that.";
      } else {
        responseText = response || "I don't understand that.";
      }
      setMessages([...messages, { text: input, isUser: true }, { text: responseText, isUser: false }]);
    }, 1000);

    setInput("");
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatBubble} onClick={() => setIsOpen(!isOpen)}>💬</div>

      <div className={`${styles.chatWrapper} ${isOpen ? styles.chatVisible : ""}`}>
        <div className={styles.chatContainer}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.isUser ? styles.userMessage : styles.assistantMessage}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className={styles.suggestionsContainer}>
          {["hello", "who are you", "class timings", "contact"].map((text) => (
            <button key={text} className={styles.suggestionBtn} onClick={() => setInput(text)}>
              {text}
            </button>
          ))}
        </div>

        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSection;
