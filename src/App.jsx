import React, { useState, useRef, useEffect } from 'react';
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const generateBotResponse = async (history) => {
    const lastMessage = history[history.length - 1];
    const formattedHistory = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    if (lastMessage.role === "user") {
      // Add "Typing..." placeholder (only if it doesn't already exist)
      setChatHistory((prev) => {
        const hasTyping = prev.some((msg) => msg.text === "Typing...");
        if (!hasTyping) {
          return [...prev, { role: "model", text: "Typing..." }];
        }
        return prev;
      });

      // Send query to Gemini API
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: formattedHistory }),
      };

      try {
        console.log("Request Options:", requestOptions); // Debugging
        const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
        const data = await response.json();
        console.log("API Response:", data); // Debugging

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch response from the server");
        }

        if (data.candidates && data.candidates.length > 0) {
          const botResponse = data.candidates[0].content.parts.map(part => part.text).join(' ').trim();
          setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== "Typing..."),
            { role: "model", text: botResponse },
          ]);
        } else {
          setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== "Typing..."),
            { role: "model", text: "I'm sorry, I couldn't find an answer to your question. Please try rephrasing it." },
          ]);
        }
      } catch (error) {
        console.error("Error in generateBotResponse:", error);
        setChatHistory((prev) => [
          ...prev.filter((msg) => msg.text !== "Typing..."),
          { role: "model", text: "Sorry, something went wrong while processing your request. Please try again later.", isError: true },
        ]);
      }
    }
  };

  // Add welcome message when the chatbot is initialized
  useEffect(() => {
    setChatHistory((prev) => {
      if (prev.some((chat) => chat.text.includes("Welcome to Faseal Chatbot"))) {
        return prev;
      }
      return [
        ...prev,
        { role: "model", text: "Welcome to Faseal Chatbot! Please feel free to ask me anything", hideInChat: false },
      ];
    });
  }, []);

  // Scroll to the bottom of the chat body when chat history updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? 'show-chatbot' : ''}`}>
      <button id="chatbot-toggler" onClick={toggleChatbot}>
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Faseal Chatbot</h2>
          </div>
          <button className="material-symbols-rounded" onClick={toggleChatbot}>keyboard_arrow_down</button>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};

export default App;