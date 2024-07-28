import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import './App.css'; // Asegúrate de tener el archivo CSS adecuado

const App = () => {
  const [socketUrl] = useState(process.env.REACT_APP_SOCKET_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

  const botMessageBuffer = useRef("");

  useEffect(() => {
    if (lastMessage !== null) {
      const newContent = lastMessage.data;

      if (newContent.includes('<1230TextEnd1971>')) {
        const completeMessage = botMessageBuffer.current + newContent.replace('<1230TextEnd1971>', '').trim();
        if (completeMessage) {
          setMessageHistory((prev) => {
            const newMessages = [...prev];
            // Remove the last incomplete message if it exists
            if (newMessages.length && newMessages[newMessages.length - 1].type === 'bot') {
              newMessages.pop();
            }
            // Add the complete message
            newMessages.push({ type: 'bot', text: completeMessage });
            return newMessages;
          });
        }
        botMessageBuffer.current = "";
        setIsSending(false);
        setIsTyping(false);
      } else {
        botMessageBuffer.current += newContent;
        setMessageHistory((prev) => {
          const newMessages = [...prev];
          if (newMessages.length && newMessages[newMessages.length - 1].type === 'bot') {
            newMessages[newMessages.length - 1].text = botMessageBuffer.current;
          } else {
            newMessages.push({ type: 'bot', text: botMessageBuffer.current });
          }
          return newMessages;
        });
        setIsTyping(true);
      }
    }
  }, [lastMessage]);

  const handleSend = () => {
    if (input && !isSending) {
      setMessageHistory((prev) => [...prev, { type: 'user', text: input }]);
      sendMessage(input);
      setInput('');
      setIsSending(true);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Lango</h1>
      </div>
      <div id="messages" className="message-container">
        {messageHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === 'user' ? 'User: ' : 'Bot: '}
            {msg.type === 'bot' ? (
              <span>{msg.text}{isTyping && index === messageHistory.length - 1 && <span className="typing-indicator">...</span>}</span>
            ) : (
              <span>{msg.text}</span>
            )}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null} 
          placeholder="Type your message here..." 
          className="input-field"
          disabled={isSending}
        />
        <button onClick={handleSend} className="send-button" disabled={isSending}>Send</button>
      </div>
    </div>
  );
};

export default App;



