import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneTilt, Smiley, Headset } from '@phosphor-icons/react';
import { getApiUrl } from '../../api/apiConfig';
import websocketService from '../../services/websocketService';
import './ChatInterface.css';

export default function ChatInterface({ onClose }) {
  const userName = localStorage.getItem('userName') || 'User';
  const userId = parseInt(localStorage.getItem('userId')) || null;
  const authToken = localStorage.getItem('authToken');
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleIncomingMessage = (message) => {
    // Handle incoming admin reply
    if (message.sender === 'ADMIN') {
      const newMessage = {
        id: Date.now(),
        sender: 'assistant',
        name: 'Admin',
        text: message.message,
        timestamp: formatTimestamp(message.timestamp),
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  // Initialize WebSocket and load chat history
  useEffect(() => {
    if (!userId || !authToken) {
      setError('Please login to use chat');
      return;
    }

    let currentSessionId = userId;

    // Initialize WebSocket connection
    websocketService.connect(
      () => {
        console.log('Customer WebSocket connected');
        // SessionId might be userId or need to be fetched from API
        // For now, using userId as sessionId (backend might create session automatically)
        setSessionId(currentSessionId);
        
        // Subscribe to receive admin replies
        if (websocketService.isConnected()) {
          websocketService.subscribe(currentSessionId, (message) => {
            console.log('Received admin reply:', message);
            handleIncomingMessage(message);
          });
        }
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        setError('Failed to connect to chat service');
      }
    );

    // Load chat history (if API available)
    // loadChatHistory();

    // Cleanup on unmount
    return () => {
      if (currentSessionId) {
        websocketService.unsubscribe(currentSessionId);
      }
      websocketService.disconnect();
    };
  }, [userId, authToken]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !userId || !authToken) {
      return;
    }

    const messageText = inputMessage.trim();
    
    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: formatTimestamp(new Date()),
      sending: true,
    };
    setMessages(prev => [...prev, tempMessage]);
    setInputMessage('');

    // Send message via API
    try {
      setLoading(true);
      setError('');

      const apiUrl = getApiUrl('/api/chat/send');
      console.log('Sending message to:', apiUrl);
      console.log('User ID:', userId);
      console.log('Message:', messageText);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          UserId: userId,
          message: messageText,
        }),
      });
      
      console.log('Send message response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('Error response body:', errorText);
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response');
        }
        
        // If 500, it's a backend server error
        if (response.status === 500) {
          throw new Error(errorData.message || 'Backend server error. Please check backend logs.');
        }
        
        throw new Error(errorData.message || 'Failed to send message');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Remove temporary message and add confirmed message
        const confirmedMessage = {
          id: Date.now() + 1,
          sender: 'user',
          text: result.data.message,
          timestamp: formatTimestamp(result.data.timestamp),
        };

        setMessages(prev => [
          ...prev.filter(m => m.id !== tempMessage.id),
          confirmedMessage
        ]);

        // Note: API response doesn't include sessionId, but backend might create one
        // The sessionId might be the userId or a separate ID created by backend
        // WebSocket subscription should work with userId initially
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
      
      // Remove failed message from UI
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      
      // Show error temporarily
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Show initial greeting if no messages
  useEffect(() => {
    if (messages.length === 0 && userName) {
      const greetingMessage = {
        id: 1,
        sender: 'assistant',
        name: 'Support',
        text: `Hey ${userName.toLowerCase()}, I'm your virtual assistant. How can I assist you?`,
        timestamp: formatTimestamp(new Date()),
      };
      setMessages([greetingMessage]);
    }
  }, [userName]);

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

      {/* Error Message */}
      {error && (
        <div className="chat-error-message">
          {error}
        </div>
      )}

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

