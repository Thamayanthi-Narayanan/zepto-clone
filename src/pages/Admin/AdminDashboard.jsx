import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaperPlaneTilt, Smiley, MagnifyingGlass, Phone, VideoCamera, DotsThreeVertical } from '@phosphor-icons/react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // TODO: Replace with actual API call later
    loadMockChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMockChats = () => {
    // Mock data with messages for each chat
    const mockChats = [
      {
        id: 1,
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

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    // Mark as read when opened
    const updatedChats = chats.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    );
    setChats(updatedChats);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChat) return;

    const newMessage = {
      id: selectedChat.messages.length + 1,
      sender: 'admin',
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', '')
    };

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: inputMessage.trim(),
      lastMessageTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    setSelectedChat(updatedChat);
    
    // Update in chats list
    const updatedChats = chats.map(c => 
      c.id === selectedChat.id ? updatedChat : c
    );
    setChats(updatedChats);
    
    setInputMessage('');
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
                className={`admin-chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
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

