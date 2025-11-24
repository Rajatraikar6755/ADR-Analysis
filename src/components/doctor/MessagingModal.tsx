import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2, Check, CheckCheck, Paperclip, X, FileText, Image as ImageIcon, Download, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { MessageContextMenu } from '@/components/shared/MessageContextMenu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  content?: string | null;
  isRead: boolean;
  isDelivered: boolean;
  hasAttachment?: boolean;
  fileName?: string | null;
  fileSize?: number | null;
  fileMimeType?: string | null;
  deletedForEveryone?: boolean;
  createdAt: string;
}

interface MessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  open,
  onOpenChange,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteForEveryone, setDeleteForEveryone] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages/conversation/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data);

        // Identify messages to mark as delivered (received by me, not yet delivered)
        const toDeliver = data
          .filter((m: Message) => m.receiverId === user?.id && !m.isDelivered)
          .map((m: Message) => m.id);

        if (toDeliver.length > 0) {
          await fetch('http://localhost:3001/api/messages/mark-delivered', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ messageIds: toDeliver }),
          });
        }

        // Identify messages to mark as read (received by me, not yet read)
        const toRead = data
          .filter((m: Message) => m.receiverId === user?.id && !m.isRead);

        for (const msg of toRead) {
          await fetch(`http://localhost:3001/api/messages/${msg.id}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching messages:', error);
    }
  }, [recipientId, user?.id]);

  useEffect(() => {
    if (open && recipientId) {
      fetchMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [open, recipientId, fetchMessages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) {
      toast.error('Message or file required');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');

      if (selectedFile) {
        // Send file message
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('recipientId', recipientId);
        if (newMessage.trim()) {
          formData.append('content', newMessage);
        }

        const res = await fetch('/api/messages/send-file', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (res.ok) {
          setNewMessage('');
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          await fetchMessages();
          toast.success('File sent');
        } else {
          const error = await res.json();
          toast.error(error.error || 'Failed to send file');
        }
      } else {
        // Send text message
        const res = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId,
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
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = forEveryone
        ? `/api/messages/${messageId}/delete-for-everyone`
        : `/api/messages/${messageId}/delete-for-me`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success(forEveryone ? 'Message deleted for everyone' : 'Message deleted');
        await fetchMessages();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleDownloadFile = async (messageId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages/file/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImageFile = (mimeType?: string | null) => {
    return mimeType?.startsWith('image/');
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message with {recipientName}
            </DialogTitle>
            <DialogDescription>
              Send and receive messages with this patient
            </DialogDescription>
          </DialogHeader>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
            {Object.entries(groupedMessages).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]: [string, Message[]]) => (
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

                      if (msg.deletedForEveryone) {
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-500 italic">
                              <p className="text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                This message was deleted
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <MessageContextMenu
                          key={msg.id}
                          message={msg}
                          currentUserId={user?.id || ''}
                          onDeleteForMe={() => {
                            setMessageToDelete(msg.id);
                            setDeleteForEveryone(false);
                            setDeleteDialogOpen(true);
                          }}
                          onDeleteForEveryone={() => {
                            setMessageToDelete(msg.id);
                            setDeleteForEveryone(true);
                            setDeleteDialogOpen(true);
                          }}
                          onDownload={msg.hasAttachment && msg.fileName ? () => handleDownloadFile(msg.id, msg.fileName!) : undefined}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                                  ? 'bg-healthcare-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                }`}
                            >
                              {msg.hasAttachment && (
                                <div className="mb-2">
                                  {isImageFile(msg.fileMimeType) ? (
                                    <div className="relative">
                                      <img
                                        src={`/api/messages/file/${msg.id}`}
                                        alt={msg.fileName || 'Image'}
                                        className="rounded max-w-full h-auto max-h-64 object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className={`flex items-center gap-2 p-2 rounded ${isOwnMessage ? 'bg-healthcare-700' : 'bg-gray-100'}`}>
                                      <FileText className="h-5 w-5" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{msg.fileName}</p>
                                        <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                          {msg.fileSize ? formatFileSize(msg.fileSize) : ''}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className={`h-8 w-8 p-0 ${isOwnMessage ? 'text-white hover:bg-healthcare-800' : ''}`}
                                        onClick={() => handleDownloadFile(msg.id, msg.fileName!)}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                              {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                              <div className="flex items-end justify-end gap-1 mt-1">
                                <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                                {isOwnMessage && (
                                  <span>
                                    {msg.isRead ? (
                                      <CheckCheck className="h-3 w-3 text-blue-300" />
                                    ) : msg.isDelivered ? (
                                      <CheckCheck className="h-3 w-3 text-gray-300" />
                                    ) : (
                                      <Check className="h-3 w-3 text-gray-300" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </MessageContextMenu>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="px-6 py-2 bg-gray-100 border-t flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t px-6 py-4 bg-white flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
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
              disabled={sending || (!newMessage.trim() && !selectedFile)}
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteForEveryone
                ? 'This message will be deleted for everyone. This action cannot be undone.'
                : 'This message will be deleted for you only.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (messageToDelete) {
                  handleDeleteMessage(messageToDelete, deleteForEveryone);
                  setDeleteDialogOpen(false);
                  setMessageToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessagingModal;
