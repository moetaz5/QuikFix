import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "./ChatBox";
import "./Chat.css";
import { MessageSquare, Loader2, UserCircle } from "lucide-react";

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des conversations :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="chat-container">
      <div className="conversations-list">
        <h3 className="conversation-title">
          <MessageSquare size={20} style={{ marginRight: 8, color: "#0056b3" }} />
          Conversations
        </h3>

        {loading ? (
          <div className="conversation-loading">
            <Loader2 className="animate-spin" size={20} color="#007bff" />
            <p>Chargement...</p>
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                selectedConversation === conv.id ? "active" : ""
              }`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div className="conversation-name">
                <UserCircle size={16} style={{ marginRight: 6 }} />
                {conv.client_name
                  ? `${conv.client_name} - ${conv.nomservice}`
                  : `Service #${conv.service_id}`}
              </div>
            </div>
          ))
        ) : (
          <p className="no-conv">Aucune conversation trouvée</p>
        )}
      </div>

      <div className="chat-box">
        {selectedConversation ? (
          <ChatBox
            conversationId={selectedConversation}
            token={localStorage.getItem("token")}
          />
        ) : (
          <div className="no-chat-selected">
            <p>Sélectionnez une conversation pour commencer 💬</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
