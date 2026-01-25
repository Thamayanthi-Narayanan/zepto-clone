import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaperPlaneTilt, Smiley, MagnifyingGlass, Phone, VideoCamera, DotsThreeVertical } from '@phosphor-icons/react';
import { getApiUrl } from '../../api/apiConfig';
import websocketService from '../../services/websocketService';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    websocketService.connect(
      () => {
        console.log('WebSocket connected successfully');
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        setError('Failed to connect to chat service');
      }
    );

    // Load chats from API
    loadChats();

    // Cleanup on unmount
    return () => {
      if (selectedChat) {
        websocketService.unsubscribe(selectedChat.sessionId || selectedChat.id);
      }
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Subscribe to WebSocket when a chat is selected
  useEffect(() => {
    if (selectedChat && websocketService.isConnected()) {
      const sessionId = selectedChat.sessionId || selectedChat.id;
      
      // Unsubscribe from previous chat if any
      websocketService.subscriptions.forEach((sub, id) => {
        if (id !== sessionId) {
          websocketService.unsubscribe(id);
        }
      });

      // Subscribe to new chat
      websocketService.subscribe(sessionId, (message) => {
        console.log('Received WebSocket message:', message);
        handleIncomingMessage(message);
      });
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const apiUrl = getApiUrl('/api/admin/chat-list');
      console.log('Loading chats from:', apiUrl);
      console.log('Admin token:', adminToken ? 'Present' : 'Missing');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      console.log('Chat list response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('Error response body:', errorText);
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response');
        }
        
        // If 404, the endpoint might not exist - show helpful message
        if (response.status === 404) {
          throw new Error(`Endpoint not found: /api/admin/chat-list. Please verify the endpoint exists on the backend.`);
        }
        
        throw new Error(errorData.message || `Failed to load chats: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && Array.isArray(result.data)) {
        // Transform API data to match component structure
        const transformedChats = result.data.map((chat, index) => ({
          id: chat.sessionId || index + 1,
          sessionId: chat.sessionId,
          customerId: chat.userId,
          customerName: `User ${chat.userId}`, // You might want to fetch user names separately
          lastMessage: chat.lastMessage || 'No messages',
          lastMessageTime: formatTime(chat.lastMessageTime),
          unreadCount: 0, // API doesn't provide this, might need separate endpoint
          status: chat.status === 'OPEN' ? 'Online' : 'Offline',
          lastSeen: formatTime(chat.lastMessageTime),
          messages: [], // Messages will be loaded when chat is selected
        }));
        setChats(transformedChats);
      } else {
        // If no chats, use empty array or mock data for testing
        console.log('No chats found or invalid response format');
        setChats([]);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      setError(err.message || 'Failed to load chats');
      // Fallback to mock data for development
      loadMockChats();
    } finally {
      setLoading(false);
    }
  };

  const handleIncomingMessage = (message) => {
    if (!selectedChat) return;

    const sessionId = selectedChat.sessionId || selectedChat.id;
    if (message.sessionId !== sessionId) return;

    // Add new message to selected chat
    const newMessage = {
      id: Date.now(),
      sender: message.sender === 'ADMIN' ? 'admin' : 'customer',
      text: message.message,
      timestamp: formatTimestamp(message.timestamp),
    };

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: message.message,
      lastMessageTime: formatTime(message.timestamp),
    };

    setSelectedChat(updatedChat);

    // Update in chats list
    const updatedChats = chats.map(c =>
      (c.sessionId || c.id) === sessionId ? updatedChat : c
    );
    setChats(updatedChats);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString();
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', '');
    } catch (error) {
      return new Date().toLocaleString();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString();
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return new Date().toLocaleTimeString();
    }
  };

  const loadMockChats = () => {
    // Mock data with messages for each chat
    const mockChats = [
      {
        id: 1,
        sessionId: 101, // Use sessionId for WebSocket
        customerId: 101,
        customerName: 'John Doe',
        lastMessage: 'Hello, I need help with my order',
        lastMessageTime: '2:30 PM',
        unreadCount: 2,
        status: 'Online',
        lastSeen: '2:02 PM',
        messages: [
          {
            id: 1,
            sender: 'customer',
            text: 'Hello, I need help with my order',
            timestamp: 'Today, 2:15 PM'
          },
          {
            id: 2,
            sender: 'admin',
            text: 'Hi John! I\'d be happy to help you with your order. Can you please share your order ID?',
            timestamp: 'Today, 2:16 PM'
          },
          {
            id: 3,
            sender: 'customer',
            text: 'Sure, it\'s #ORD12345',
            timestamp: 'Today, 2:17 PM'
          },
          {
            id: 4,
            sender: 'customer',
            text: 'When will it be delivered?',
            timestamp: 'Today, 2:30 PM'
          }
        ]
      },
      {
        id: 2,
        sessionId: 102, // Use sessionId for WebSocket
        customerId: 102,
        customerName: 'Jane Smith',
        lastMessage: 'When will my order be delivered?',
        lastMessageTime: '1:15 PM',
        unreadCount: 0,
        status: 'Offline',
        lastSeen: '12:45 PM',
        messages: [
          {
            id: 1,
            sender: 'customer',
            text: 'When will my order be delivered?',
            timestamp: 'Today, 1:10 PM'
          },
          {
            id: 2,
            sender: 'admin',
            text: 'Hi Jane! Your order is scheduled for delivery tomorrow between 10 AM - 2 PM.',
            timestamp: 'Today, 1:12 PM'
          },
          {
            id: 3,
            sender: 'customer',
            text: 'Thank you!',
            timestamp: 'Today, 1:15 PM'
          }
        ]
      },
      {
        id: 3,
        sessionId: 103, // Use sessionId for WebSocket
        customerId: 103,
        customerName: 'Mike Johnson',
        lastMessage: 'Thank you for your help!',
        lastMessageTime: '12:45 PM',
        unreadCount: 0,
        status: 'Online',
        lastSeen: '12:50 PM',
        messages: [
          {
            id: 1,
            sender: 'customer',
            text: 'I have a question about returns',
            timestamp: 'Today, 12:30 PM'
          },
          {
            id: 2,
            sender: 'admin',
            text: 'Sure, I can help with that. What would you like to return?',
            timestamp: 'Today, 12:32 PM'
          },
          {
            id: 3,
            sender: 'customer',
            text: 'Thank you for your help!',
            timestamp: 'Today, 12:45 PM'
          }
        ]
      },
      {
        id: 4,
        sessionId: 104, // Use sessionId for WebSocket
        customerId: 104,
        customerName: 'Sarah Williams',
        lastMessage: 'I want to return a product',
        lastMessageTime: '11:20 AM',
        unreadCount: 1,
        status: 'Offline',
        lastSeen: '10:30 AM',
        messages: [
          {
            id: 1,
            sender: 'customer',
            text: 'I want to return a product',
            timestamp: 'Today, 11:15 AM'
          },
          {
            id: 2,
            sender: 'admin',
            text: 'I can help you with the return process. Please share your order details.',
            timestamp: 'Today, 11:18 AM'
          },
          {
            id: 3,
            sender: 'customer',
            text: 'Order #ORD67890',
            timestamp: 'Today, 11:20 AM'
          }
        ]
      }
    ];
    
    setChats(mockChats);
  };

  const handleChatClick = async (chat) => {
    // Unsubscribe from previous chat
    if (selectedChat) {
      const prevSessionId = selectedChat.sessionId || selectedChat.id;
      websocketService.unsubscribe(prevSessionId);
    }

    // If chat has no messages, we might need to load them
    // For now, WebSocket will handle real-time messages
    // If you have an API to fetch chat history, call it here
    
    setSelectedChat(chat);
    
    // Subscribe to new chat's WebSocket
    const sessionId = chat.sessionId || chat.id;
    if (websocketService.isConnected()) {
      websocketService.subscribe(sessionId, (message) => {
        handleIncomingMessage(message);
      });
    }
    
    // Mark as read when opened
    const updatedChats = chats.map(c => 
      (c.sessionId || c.id) === (chat.sessionId || chat.id) ? { ...c, unreadCount: 0 } : c
    );
    setChats(updatedChats);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChat) return;

    const messageText = inputMessage.trim();
    const sessionId = selectedChat.sessionId || selectedChat.id;
    
    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now(),
      sender: 'admin',
      text: messageText,
      timestamp: formatTimestamp(new Date()),
      sending: true, // Mark as sending
    };

    const tempUpdatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, tempMessage],
      lastMessage: messageText,
      lastMessageTime: formatTime(new Date()),
    };

    setSelectedChat(tempUpdatedChat);
    
    // Update in chats list
    const tempUpdatedChats = chats.map(c =>
      (c.sessionId || c.id) === sessionId ? tempUpdatedChat : c
    );
    setChats(tempUpdatedChats);
    
    setInputMessage('');

    // Send message via API
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(getApiUrl('/api/admin/chat/reply'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          message: messageText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Remove temporary message and add confirmed message
        const confirmedMessage = {
          id: Date.now() + 1,
          sender: 'admin',
          text: result.data.message,
          timestamp: formatTimestamp(result.data.timestamp),
        };

        const confirmedChat = {
          ...selectedChat,
          messages: [
            ...selectedChat.messages.filter(m => m.id !== tempMessage.id),
            confirmedMessage
          ],
          lastMessage: result.data.message,
          lastMessageTime: formatTime(result.data.timestamp),
        };

        setSelectedChat(confirmedChat);
        
        // Update in chats list
        const confirmedChats = chats.map(c =>
          (c.sessionId || c.id) === sessionId ? confirmedChat : c
        );
        setChats(confirmedChats);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
      
      // Remove failed message from UI
      const failedChat = {
        ...selectedChat,
        messages: selectedChat.messages.filter(m => m.id !== tempMessage.id),
      };
      setSelectedChat(failedChat);
      
      // Update in chats list
      const failedChats = chats.map(c =>
        (c.sessionId || c.id) === sessionId ? failedChat : c
      );
      setChats(failedChats);
      
      // Show error temporarily
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    navigate('/admin/login');
  };

  const filteredChats = chats.filter(chat =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Left Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-icon admin-logo-icon">
          <span>∞</span>
        </div>
        <div className="admin-sidebar-icon">
          <Phone size={24} weight="regular" />
        </div>
        <div className="admin-sidebar-icon">
          <VideoCamera size={24} weight="regular" />
        </div>
        <div className="admin-sidebar-icon">
          <Smiley size={24} weight="regular" />
        </div>
        <div className="admin-sidebar-icon">
          <MagnifyingGlass size={24} weight="regular" />
        </div>
        <div className="admin-sidebar-icon active">
          <PaperPlaneTilt size={24} weight="fill" />
        </div>
      </div>

      {/* Chat List Panel */}
      <div className="admin-chat-list-panel">
        <div className="admin-chat-list-header">
          <h2 className="admin-chat-list-title">Messages</h2>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        
        <div className="admin-chat-search">
          <MagnifyingGlass size={20} weight="regular" />
          <input
            type="text"
            placeholder="Search direct message"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-chat-list">
          {filteredChats.length === 0 ? (
            <div className="admin-empty">No chats found</div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`admin-chat-item ${(selectedChat?.sessionId || selectedChat?.id) === (chat.sessionId || chat.id) ? 'active' : ''}`}
                onClick={() => handleChatClick(chat)}
              >
                <div className="admin-chat-avatar">
                  {getInitials(chat.customerName)}
                </div>
                <div className="admin-chat-info">
                  <div className="admin-chat-customer">
                    {chat.customerName}
                  </div>
                  <div className="admin-chat-last-message">
                    {chat.lastMessage}
                  </div>
                </div>
                <div className="admin-chat-meta">
                  <div className="admin-chat-time">
                    Today, {chat.lastMessageTime}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="admin-chat-unread">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Chat Panel */}
      <div className="admin-active-chat-panel">
        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="admin-chat-header">
              <div className="admin-chat-header-left">
                <div className="admin-chat-header-avatar">
                  {getInitials(selectedChat.customerName)}
                </div>
                <div className="admin-chat-header-info">
                  <div className="admin-chat-header-name">{selectedChat.customerName}</div>
                  <div className="admin-chat-header-status">
                    {selectedChat.status} - Last seen, {selectedChat.lastSeen}
                  </div>
                </div>
              </div>
              <div className="admin-chat-header-actions">
                <button className="admin-chat-action-btn">
                  <Phone size={20} weight="regular" />
                </button>
                <button className="admin-chat-action-btn">
                  <VideoCamera size={20} weight="regular" />
                </button>
                <button className="admin-chat-action-btn">
                  <DotsThreeVertical size={20} weight="regular" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="admin-messages-container">
              {selectedChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`admin-message ${message.sender === 'admin' ? 'admin-sent' : 'customer-received'}`}
                >
                  <div className="admin-message-bubble">
                    {message.text}
                  </div>
                  <div className="admin-message-time">
                    {message.timestamp}
                    {message.sender === 'admin' && (
                      <span className="admin-message-check">✓✓</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="admin-chat-input-container" onSubmit={handleSendMessage}>
              <button type="button" className="admin-chat-emoji-btn">
                <Smiley size={24} weight="regular" />
              </button>
              <input
                type="text"
                className="admin-chat-input"
                placeholder="Message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button 
                type="submit" 
                className="admin-chat-send-btn"
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </button>
            </form>
          </>
        ) : (
          <div className="admin-no-chat-selected">
            <div className="admin-no-chat-icon">
              <PaperPlaneTilt size={48} weight="regular" />
            </div>
            <h3>Select a chat to start messaging</h3>
            <p>Choose a customer from the list to view and respond to their messages</p>
          </div>
        )}
      </div>
    </div>
  );
}

