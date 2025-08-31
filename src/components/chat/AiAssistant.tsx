import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Info, Bot, User, Paperclip, X } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  imageUrl?: string;
}

const getAIResponse = async (message: string, image: File | null): Promise<string> => {
  const formData = new FormData();
  formData.append('message', message);
  if (image) {
    formData.append('image', image);
  }

  // The headers property has been removed.
  // The browser will now set the correct Content-Type automatically.
  const response = await fetch("http://localhost:3001/api/ai-assistant", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get a response from the AI assistant.");
  }

  const data = await response.json();
  return data.response;
};

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! You can now ask questions and attach an image. How can I assist?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const sendMessage = async () => {
    if (!input.trim() && !imageFile) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      imageUrl: previewUrl || undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImageFile = imageFile;

    setInput('');
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(true);
    
    try {
      const response = await getAIResponse(currentInput, currentImageFile);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Health Assistant</h1>
        <p className="text-gray-600">Ask questions, upload images, or get general wellness advice</p>
      </div>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This AI assistant provides general health information only and is not a substitute for professional medical advice.
        </AlertDescription>
      </Alert>

      <Card className="border-healthcare-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Bot className="h-5 w-5 mr-2 text-healthcare-600" />
            Health Assistant
          </CardTitle>
          <CardDescription>
            Your conversation is private and secure
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'assistant' && <Bot className="h-6 w-6 text-healthcare-600 flex-shrink-0" />}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-healthcare-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.imageUrl && (
                    <img src={message.imageUrl} alt="User upload" className="rounded-md mb-2 max-w-xs" />
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && <User className="h-6 w-6 bg-gray-200 p-1 rounded-full flex-shrink-0" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                      <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          <Loader2 className="h-5 w-5 animate-spin text-healthcare-600" />
                          <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="pt-4 flex-col items-start">
          {previewUrl && (
            <div className="relative mb-2">
              <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-700 text-white hover:bg-gray-900"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex w-full items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message or attach a file..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !imageFile)}
              className="bg-healthcare-600 hover:bg-healthcare-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AiAssistant;