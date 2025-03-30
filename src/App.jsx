import React, { useState, useRef, useEffect } from 'react';
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from './components/companyinfo';

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: companyInfo,
      hideInChat: true,
    }
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const generateBotResponse = async (history) => {
    const lastMessage = history[history.length - 1];
    if (lastMessage.role === "user") {
      const userInput = lastMessage.text.toLowerCase();

      if (userInput.includes("tell me about yourself") || userInput.includes("about the company")) {
        setChatHistory(prev => [
          ...prev.filter(msg => msg.text !== "Typing..."),
          { hideInChat: true,
            role: "model",
             text: companyInfo },
        ]);
        return;
      }
    }

    const formattedHistory = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch response from the server");
      }

      if (data.candidates && data.candidates.length > 0) {
        const botResponse = data.candidates[0].content.parts.map(part => part.text).join(' ').trim();
        setChatHistory(prev => [
          ...prev.filter(msg => msg.text !== "Typing..."),
          { role: "model", text: botResponse },
        ]);
      }
    } catch (error) {
      console.error("Error in generateBotResponse:", error);
      
      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== "Typing..."),
        { role: "model", text: "Sorry, something went wrong. Please try again.", isError: true },
      ]);
    }
  };

  useEffect(() => {
    setChatHistory(prev => {
      if (prev.some(chat => chat.text === "Welcome to Faseal Chatbot! Please feel free to ask me anything")) {
        return prev;
      }
      return [
        ...prev,
        { role: "model", text: "Welcome to Faseal Chatbot! Please feel free to ask me anything", hideInChat: false }
      ];
    });
  }, []);

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