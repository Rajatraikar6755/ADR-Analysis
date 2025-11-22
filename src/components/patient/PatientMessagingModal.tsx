import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { MessageSquare, Send, Loader2, Lock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiverId: string;
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctor: {
    id: string;
    name: string;
    email: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

interface PatientMessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
  appointmentStatus: string;
}

export const PatientMessagingModal: React.FC<PatientMessagingModalProps> = ({
  open,
  onOpenChange,
  doctorId,
  doctorName,
  appointmentStatus,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAppointmentConfirmed = appointmentStatus === 'CONFIRMED';

  useEffect(() => {
    if (open && isAppointmentConfirmed) {
      fetchMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [open, isAppointmentConfirmed]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages/conversation/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: doctorId,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        await fetchMessages();
        toast.success('Message sent');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: any, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message with {doctorName}
          </DialogTitle>
          <DialogDescription>
            {isAppointmentConfirmed 
              ? 'Send and receive messages with your doctor'
              : 'Messages will be available once your appointment is confirmed'}
          </DialogDescription>
        </DialogHeader>

        {!isAppointmentConfirmed ? (
          // Appointment not confirmed
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <Lock className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Messaging Locked</h3>
            <p className="text-gray-600 text-center mb-4">
              You can only message the doctor once your appointment is <span className="font-semibold text-green-600">CONFIRMED</span>.
            </p>
            <p className="text-sm text-gray-500 text-center">
              Current status: <span className={`font-semibold ${
                appointmentStatus === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
              }`}>{appointmentStatus}</span>
            </p>
          </div>
        ) : loading ? (
          // Loading state
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div>
          </div>
        ) : (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {Object.entries(groupedMessages).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="border-t border-gray-300 flex-1"></div>
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 mx-2">
                        {date}
                      </span>
                      <div className="border-t border-gray-300 flex-1"></div>
                    </div>

                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {dateMessages.map((msg: Message) => {
                        const isOwnMessage = msg.senderId === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-healthcare-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t px-6 py-4 bg-white flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-healthcare-600 hover:bg-healthcare-700"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientMessagingModal;
