import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast: showToast } = useToast();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchConversations();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.listing_id, selectedConversation.other_user_id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setConversations(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedConversation(data.data[0]);
        }
      } else {
        showToast(data.message || 'Failed to fetch conversations', 'error');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      showToast('Network error or server unreachable.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (listingId, otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/messages?listing_id=${listingId}&other_user_id=${otherUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages(data.data || []);
        // Mark messages as read
        markMessagesAsRead(listingId, otherUserId);
      } else {
        showToast(data.message || 'Failed to fetch messages', 'error');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast('Network error or server unreachable.', 'error');
    }
  };

  const markMessagesAsRead = async (listingId, otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: listingId,
          other_user_id: otherUserId
        })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) {
      return;
    }

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: selectedConversation.listing_id,
          receiver_id: selectedConversation.other_user_id,
          message: newMessage.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setNewMessage('');
        // Refresh messages
        fetchMessages(selectedConversation.listing_id, selectedConversation.other_user_id);
        // Refresh conversations to update last message
        fetchConversations();
      } else {
        showToast(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Network error or server unreachable.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Conversations</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Start messaging sellers to see conversations here</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={`${conversation.listing_id}-${conversation.other_user_id}`}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.listing_id === conversation.listing_id &&
                        selectedConversation?.other_user_id === conversation.other_user_id
                          ? 'bg-blue-50 border-blue-200'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {conversation.other_user_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.other_user_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(conversation.last_message_date)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.listing_title}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {conversation.last_message}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {selectedConversation.other_user_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedConversation.other_user_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          About: {selectedConversation.listing_title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user?.id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatMessageDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

