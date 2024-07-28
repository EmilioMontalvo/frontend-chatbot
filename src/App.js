import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';



const App = () => {
  const [socketUrl] = useState(process.env.REACT_APP_SOCKET_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Nuevo estado para controlar el efecto de escritura
  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

  const botMessageBuffer = useRef("");

  useEffect(() => {
    if (lastMessage !== null) {
      const newContent = lastMessage.data;

      if (newContent.includes('<1230TextEnd1971>')) {
        const completeMessage = botMessageBuffer.current + newContent.replace('<1230TextEnd1971>', '').trim();
        setMessageHistory((prev) => [
          ...prev,
          { type: 'bot', text: completeMessage },
        ]);
        botMessageBuffer.current = "";
        setIsSending(false);
        setIsTyping(false); // Detener el efecto de escritura cuando se recibe el mensaje completo
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
        setIsTyping(true); // Iniciar el efecto de escritura cuando se recibe parte del mensaje
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
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial, sans-serif' }}>
      <div id="messages" style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messageHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`} style={{ color: msg.type === 'user' ? 'blue' : 'green' }}>
            {msg.type === 'user' ? 'User: ' : 'Bot: '}
            {msg.type === 'bot' && isTyping ? (
              <span>{msg.text}<span className="typing-indicator">...</span></span>
            ) : (
              <span>{msg.text}</span>
            )}
          </div>
        ))}
      </div>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null} 
        placeholder="Type your message here..." 
        style={{ width: 'calc(100% - 100px)', marginRight: '10px' }} 
        disabled={isSending}
      />
      <button onClick={handleSend} style={{ width: '90px' }} disabled={isSending}>Send</button>
    </div>
  );
};

export default App;
