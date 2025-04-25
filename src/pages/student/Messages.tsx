
import { useState } from "react";
import Layout from "../../components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface Message {
  id: number;
  sender: "student" | "counselor";
  senderName: string;
  senderInitial: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: number;
  with: string;
  withInitial: string;
  withRole: "counselor";
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  
  // Mock data for conversations
  const conversations: Conversation[] = [
    {
      id: 1,
      with: "Dr. Jamie Counselor",
      withInitial: "J",
      withRole: "counselor",
      lastMessage: "Yes, that time works for me. I'll see you then!",
      lastTimestamp: "Today, 2:30 PM",
      unreadCount: 0,
    },
    {
      id: 2,
      with: "Dr. Jordan Smith",
      withInitial: "J",
      withRole: "counselor",
      lastMessage: "Have you tried the breathing exercise we discussed?",
      lastTimestamp: "Yesterday",
      unreadCount: 1,
    },
  ];
  
  // Mock data for messages in a conversation
  const messages: Record<number, Message[]> = {
    1: [
      {
        id: 1,
        sender: "student",
        senderName: "You",
        senderInitial: "Y",
        content: "Hello Dr. Jamie, I wanted to check if we could meet tomorrow at 3 PM?",
        timestamp: "Today, 2:15 PM",
        read: true,
      },
      {
        id: 2,
        sender: "counselor",
        senderName: "Dr. Jamie Counselor",
        senderInitial: "J",
        content: "Hi there! Yes, that time works for me. I'll see you then!",
        timestamp: "Today, 2:30 PM",
        read: true,
      },
    ],
    2: [
      {
        id: 1,
        sender: "counselor",
        senderName: "Dr. Jordan Smith",
        senderInitial: "J",
        content: "We discussed some breathing techniques during our last session. Have you had a chance to try them?",
        timestamp: "Yesterday, 4:00 PM",
        read: true,
      },
      {
        id: 2,
        sender: "counselor",
        senderName: "Dr. Jordan Smith",
        senderInitial: "J",
        content: "Have you tried the breathing exercise we discussed?",
        timestamp: "Yesterday, 4:30 PM",
        read: false,
      },
    ],
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedConversation) return;
    
    // In a real app, we would send this to the Supabase backend
    // For now, we'll just clear the input
    
    setNewMessage("");
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-bridge-primary">Messages</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Communicate with your support team
        </p>
      </div>
      
      <Card className="bridge-card overflow-hidden">
        <div className="flex h-[calc(100vh-200px)] md:h-[600px]">
          {/* Conversations list - hidden on mobile when a conversation is selected */}
          <div className={`${
            selectedConversation ? "hidden md:block" : ""
          } w-full md:w-1/3 border-r border-bridge-muted/30`}>
            <div className="p-4 border-b border-bridge-muted/30">
              <h2 className="font-medium">Conversations</h2>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-4 cursor-pointer border-b border-bridge-muted/10 hover:bg-bridge-muted/10 ${
                    selectedConversation === conversation.id ? "bg-bridge-muted/20" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-bridge-accent text-bridge-primary">
                      {conversation.withInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{conversation.with}</h3>
                      <span className="text-xs text-bridge-text/70">{conversation.lastTimestamp}</span>
                    </div>
                    <p className="text-sm text-bridge-text/70 truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="ml-2 bg-bridge-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Message area */}
          <div className={`${
            selectedConversation ? "flex" : "hidden md:flex"
          } flex-col flex-1`}>
            {selectedConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b border-bridge-muted/30 flex items-center justify-between">
                  <div className="flex items-center">
                    <button 
                      className="md:hidden mr-2 text-bridge-text/70"
                      onClick={() => setSelectedConversation(null)}
                    >
                      ← Back
                    </button>
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="bg-bridge-accent text-bridge-primary">
                        {conversations.find(c => c.id === selectedConversation)?.withInitial}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">
                      {conversations.find(c => c.id === selectedConversation)?.with}
                    </h3>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages[selectedConversation]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "student" ? "justify-end" : ""}`}
                    >
                      <div className={`flex max-w-[75%] ${message.sender === "student" ? "flex-row-reverse" : ""}`}>
                        {message.sender === "counselor" && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-bridge-accent text-bridge-primary">
                              {message.senderInitial}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.sender === "student"
                                ? "bg-bridge-primary text-white"
                                : "bg-bridge-muted/20 text-bridge-text"
                            }`}
                          >
                            {message.content}
                          </div>
                          <div
                            className={`text-xs text-bridge-text/50 mt-1 ${
                              message.sender === "student" ? "text-right" : ""
                            }`}
                          >
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-bridge-muted/30">
                  <form 
                    className="flex items-center space-x-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bridge-input flex-1"
                    />
                    <Button 
                      type="submit"
                      className="bridge-button-primary" 
                      disabled={newMessage.trim() === ""}
                    >
                      <Send size={18} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              // Empty state for desktop when no conversation is selected
              <div className="hidden md:flex flex-col items-center justify-center h-full text-bridge-text/50">
                <MessageSquare className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p>Choose a conversation from the list</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default Messages;
