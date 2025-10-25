import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css";
import { SendHorizontal, MessageCircle } from "lucide-react";

const ChatBox = ({ conversationId, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const userId = JSON.parse(atob(token.split(".")[1])).userId;

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
      scrollToBottom();
    } catch (error) {
      console.error("Erreur lors du chargement des messages :", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/conversations/${conversationId}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Erreur lors de l’envoi du message :", error);
    }
  };

  return (
    <div className="chat-box-modern">
      <div className="chat-header">
        <MessageCircle size={18} style={{ marginRight: 6 }} />
        Discussion
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.sender_id === userId ? "sent" : "received"
            }`}
          >
            <div className="sender-name">{msg.sender_name}</div>
            <div className="content">{msg.content}</div>
            <div className="time">
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrire un message..."
        />
        <button onClick={sendMessage} title="Envoyer le message">
          <SendHorizontal size={22} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
