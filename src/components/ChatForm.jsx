import { useRef, useState } from 'react';

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();
  const [isInputValid, setIsInputValid] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    inputRef.current.value = '';

    const newHistory = [
      ...chatHistory,
      { role: "user", text: userMessage },
      { role: "model", text: "Typing..." },
    ];
    setChatHistory(newHistory);

    
    generateBotResponse([...newHistory, { role: "user", text: `Using the details provided above,please address this query: ${userMessage}` }]);
    setIsInputValid(false);
  };

  const handleInputChange = () => {
    setIsInputValid(inputRef.current.value.trim().length > 0);
  };

  return (
    <div>
      <form className="chat-form" onSubmit={handleFormSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your message"
          className="message-input"
          required
          onChange={handleInputChange}
        />
        <button type="submit" className={`material-symbols-rounded ${isInputValid ? 'visible' : ''}`}>
          keyboard_arrow_up
        </button>
      </form>
    </div>
  );
};

export default ChatForm;