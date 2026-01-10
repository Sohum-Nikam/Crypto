import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Connect to Socket.IO server
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:4567', {
      auth: {
        token: token,
      },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('receiveMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('errorMessage', (data: { error: string }) => {
      console.error('Chat error:', data.error);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    // Clean up
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputText.trim() === '' || !socket) return;

    socket.emit('sendMessage', { text: inputText });
    setInputText('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Crypto Exchange Chat</h3>
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <div className="message-header">
              <span className="sender-name">{message.senderName}</span>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          disabled={!socket || !isConnected}
        />
        <button type="submit" disabled={!socket || !isConnected}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;