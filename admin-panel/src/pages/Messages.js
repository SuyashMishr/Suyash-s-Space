import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail,
  Search,
  Filter,
  Eye,
  Reply,
  Trash2,
  Calendar,
  User,
  AtSign,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const response = await fetch('http://localhost:4000/api/admin/contact-messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(msg => msg.status === filter);
    }

    setFilteredMessages(filtered);
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`http://localhost:4000/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessages(messages.map(msg => 
          msg._id === messageId ? { ...msg, status } : msg
        ));
      }
    } catch (error) {
      console.error('Failed to update message status:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`http://localhost:4000/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg._id !== messageId));
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`http://localhost:4000/api/admin/contact-messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: replyText,
          recipientEmail: selectedMessage.email,
          recipientName: selectedMessage.name
        }),
      });

      if (response.ok) {
        setReplyText('');
        setIsReplying(false);
        updateMessageStatus(selectedMessage._id, 'replied');
        alert('Reply sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-3 h-3" />;
      case 'read': return <Eye className="w-3 h-3" />;
      case 'replied': return <CheckCircle className="w-3 h-3" />;
      case 'archived': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Mail className="mr-3 h-8 w-8 text-blue-500" />
                Contact Messages
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and respond to contact form submissions
              </p>
            </div>
            <button
              onClick={fetchMessages}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white rounded-lg shadow-sm border"
          >
            <div className="p-4 border-b">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {['all', 'new', 'read', 'replied', 'archived'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${ 
                      filter === filterOption
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages found</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${ 
                      selectedMessage?._id === message._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{message.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${getStatusColor(message.status || 'new')}`}>
                        {getStatusIcon(message.status || 'new')}
                        {message.status || 'new'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {message.subject || 'No subject'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(message.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Message Detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm border"
          >
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                {/* Message Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-gray-500" />
                        {selectedMessage.name}
                      </h2>
                      <p className="text-gray-600 flex items-center mt-1">
                        <AtSign className="w-4 h-4 mr-2" />
                        {selectedMessage.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedMessage.status || 'new'}
                        onChange={(e) => updateMessageStatus(selectedMessage._id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button
                        onClick={() => deleteMessage(selectedMessage._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {selectedMessage.subject && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                        {selectedMessage.subject}
                      </h3>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedMessage.createdAt || Date.now()).toLocaleString()}
                    {selectedMessage.userIP && (
                      <span className="ml-4">
                        IP: {selectedMessage.userIP}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                      {selectedMessage.message}
                    </pre>
                  </div>

                  {/* Reply Section */}
                  {!isReplying ? (
                    <button
                      onClick={() => setIsReplying(true)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t pt-6"
                    >
                      <h4 className="font-medium text-gray-900 mb-3">Send Reply</h4>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${selectedMessage.name}...`}
                        rows={6}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => {
                            setIsReplying(false);
                            setReplyText('');
                          }}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={sendReply}
                          disabled={!replyText.trim()}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a message to view details</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
