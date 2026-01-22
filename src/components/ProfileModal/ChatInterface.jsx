import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneTilt, Smiley, Headset } from '@phosphor-icons/react';
import './ChatInterface.css';

export default function ChatInterface({ onClose }) {
  const userName = localStorage.getItem('userName') || 'User';
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      name: 'John',
      text: `Hey ${userName.toLowerCase()}, im john your virtual assist. how can I assist you`,
      timestamp: '07:30 PM'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Hey john',
      timestamp: '07:31 PM'
    },
    {
      id: 3,
      sender: 'user',
      text: 'Why we need a accommodation with rave?',
      timestamp: '07:31 PM'
    },
    {
      id: 4,
      sender: 'assistant',
      name: 'John',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      timestamp: '07:33 PM'
    },
    {
      id: 5,
      sender: 'user',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
      timestamp: '07:31 PM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) {
      return; // Don't send empty messages
    }
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
    setMessages([...messages, newMessage]);
    setInputMessage('');
    // TODO: Send message to API and get response
  };

  return (
    <div className="chat-interface-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-icon">
            <Headset size={20} weight="fill" />
          </div>
          <div className="chat-header-title">Customer support</div>
        </div>
        <button className="chat-end-btn" onClick={onClose}>
          End chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            {message.sender === 'assistant' && (
              <div className="chat-message-name">{message.name}</div>
            )}
            <div className="chat-message-bubble">
              {message.text}
            </div>
            <div className="chat-message-time">{message.timestamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <button type="button" className="chat-emoji-btn">
          <Smiley size={24} weight="regular" />
        </button>
        <input
          type="text"
          className="chat-input"
          placeholder="Message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
        >
          <PaperPlaneTilt size={20} weight="fill" />
        </button>
      </form>
    </div>
  );
}

