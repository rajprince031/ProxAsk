import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

const MessagesPage = () => {
  const [conversations] = useState([
    { id: 1, name: 'Alice Johnson', username: 'alice', lastMessage: 'Thanks for answering my question!', time: '10m ago', unread: false },
    { id: 2, name: 'Sarah Wilson', username: 'sarahw', lastMessage: 'Can you share more details about your setup?', time: '1h ago', unread: true },
    { id: 3, name: 'Alex Rodriguez', username: 'techguru', lastMessage: 'Great insights on the database question.', time: '1d ago', unread: false }
  ]);
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'alice', text: 'Hey there! Loved your answer on the React practices question.', time: '10:30 AM' },
    { id: 2, sender: 'me', text: 'Thank you Alice! Happy to share what worked for me.', time: '10:32 AM' },
    { id: 3, sender: 'alice', text: 'Thanks for answering my question!', time: '10:33 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: 'me',
      text: newMessage.trim(),
      time: 'Just now'
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {/* Conversations List */}
      <div style={{ width: '320px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                cursor: 'pointer',
                background: selectedChat?.id === chat.id ? '#f3f4f6' : '#fff',
                borderBottom: '1px solid #f9fafb'
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {chat.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{chat.name}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{chat.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {selectedChat?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', color: '#111827' }}>{selectedChat?.name}</h4>
            <span style={{ fontSize: '12px', color: '#16a34a' }}>● Online</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map(m => (
            <div
              key={m.id}
              style={{
                alignSelf: m.sender === 'me' ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                background: m.sender === 'me' ? '#2563eb' : '#f3f4f6',
                color: m.sender === 'me' ? '#fff' : '#111827',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '14px'
              }}
            >
              <p style={{ margin: 0 }}>{m.text}</p>
              <span style={{ display: 'block', fontSize: '10px', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                {m.time}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid #d1d5db', fontSize: '14px' }}
          />
          <button
            type="submit"
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesPage;
