import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare, Search } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useDebounce } from "@/hooks/useDebounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface Counselor {
  id: string;
  name: string;
  withInitial: string;
  avatar_url?: string;
  last_message?: string;
  unread_count?: number;
}

const Messages = () => {
  const { user } = useAuth();
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.id;
  
  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    updateTypingStatus,
    isTyping
  } = useMessages(selectedCounselor || '');

  const { data: counselors = [], isLoading: counselorsLoading } = useQuery({
    queryKey: ['student_counselors', currentUserId],
    queryFn: async () => {
      return [
        {
          id: "1",
          name: "Dr. Jamie Wilson",
          withInitial: "J",
          avatar_url: null,
          last_message: "Remember to try those breathing exercises we discussed when you feel overwhelmed.",
          unread_count: 2
        },
        {
          id: "2",
          name: "Dr. Sarah Chen",
          withInitial: "S",
          avatar_url: null,
          last_message: "Looking forward to our session tomorrow at 2pm!",
          unread_count: 0
        },
        {
          id: "3",
          name: "Dr. Michael Brown",
          withInitial: "M",
          avatar_url: null,
          last_message: "Great progress in our last session. Keep practicing mindfulness!",
          unread_count: 1
        }
      ] as Counselor[];
    },
    enabled: !!currentUserId
  });

  useDebounce(
    () => {
      if (selectedCounselor) {
        updateTypingStatus(newMessage.length > 0);
      }
    },
    500,
    [newMessage]
  );
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredCounselors = counselors.filter(counselor => 
    counselor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedCounselor) return;
    sendMessage(newMessage);
    setNewMessage("");
    updateTypingStatus(false);
  };

  const selectedCounselorData = counselors.find(c => c.id === selectedCounselor);

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
          <div className={`${
            selectedCounselor ? "hidden md:block" : ""
          } w-full md:w-1/3 border-r border-bridge-muted/30`}>
            <div className="p-4 border-b border-bridge-muted/30">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-bridge-text/50" size={18} />
                <Input
                  placeholder="Search counselors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bridge-input"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-60px)]">
              {counselorsLoading ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-bridge-text/50">Loading counselors...</p>
                </div>
              ) : filteredCounselors.length === 0 ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-bridge-text/50">No counselors found</p>
                </div>
              ) : (
                filteredCounselors.map((counselor) => (
                  <div
                    key={counselor.id}
                    className={`flex items-center p-4 cursor-pointer hover:bg-bridge-muted/10 ${
                      selectedCounselor === counselor.id ? "bg-bridge-muted/20" : ""
                    }`}
                    onClick={() => setSelectedCounselor(counselor.id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      {counselor.avatar_url ? (
                        <AvatarImage src={counselor.avatar_url} alt={counselor.name} />
                      ) : (
                        <AvatarFallback className="bg-bridge-accent text-bridge-primary">
                          {counselor.withInitial}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{counselor.name}</h3>
                        {counselor.unread_count ? (
                          <span className="bg-bridge-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {counselor.unread_count}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-bridge-text/70 truncate">{counselor.last_message || "No messages yet"}</p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
          
          <div className={`${
            selectedCounselor ? "flex" : "hidden md:flex"
          } flex-col flex-1`}>
            {selectedCounselor ? (
              <>
                <div className="p-4 border-b border-bridge-muted/30">
                  <div className="flex items-center">
                    <button 
                      className="md:hidden mr-2 text-bridge-text/70"
                      onClick={() => setSelectedCounselor(null)}
                    >
                      ← Back
                    </button>
                    <Avatar className="h-8 w-8 mr-3">
                      {selectedCounselorData?.avatar_url ? (
                        <AvatarImage src={selectedCounselorData.avatar_url} alt={selectedCounselorData.name} />
                      ) : (
                        <AvatarFallback className="bg-bridge-accent text-bridge-primary">
                          {selectedCounselorData?.withInitial}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="font-medium">
                      {selectedCounselorData?.name}
                    </h3>
                  </div>
                  {isTyping && (
                    <p className="text-sm text-bridge-text/70 mt-1">typing...</p>
                  )}
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-bridge-text/50">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="h-12 w-12 mb-2 text-bridge-text/30" />
                      <p className="text-bridge-text/50">No messages yet</p>
                      <p className="text-sm text-bridge-text/30">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id !== currentUserId ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`flex max-w-[75%] ${message.sender_id !== currentUserId ? "" : "flex-row-reverse"}`}>
                            {message.sender_id !== currentUserId && (
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-bridge-accent text-bridge-primary">
                                  {selectedCounselorData?.withInitial}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  message.sender_id !== currentUserId
                                    ? "bg-bridge-muted/20 text-bridge-text"
                                    : "bg-bridge-primary text-white"
                                }`}
                              >
                                {message.content}
                              </div>
                              <div
                                className={`text-xs text-bridge-text/50 mt-1 ${
                                  message.sender_id !== currentUserId ? "" : "text-right"
                                }`}
                              >
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
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
