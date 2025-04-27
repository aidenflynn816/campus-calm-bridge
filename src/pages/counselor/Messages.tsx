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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  avatar_url?: string;
  last_message?: string;
  unread_count?: number;
}

const CounselorMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
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
  } = useMessages(selectedStudent || '');

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['counselor_students', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      return [
        {
          id: "student-1",
          name: "Alex Thompson",
          avatar_url: null,
          last_message: "Thanks Dr., the meditation techniques really helped with my test anxiety.",
          unread_count: 1
        },
        {
          id: "student-2",
          name: "Jordan Martinez",
          avatar_url: null,
          last_message: "Can we schedule a session for next week?",
          unread_count: 3
        },
        {
          id: "student-3",
          name: "Sam Wilson",
          avatar_url: null,
          last_message: "I've been feeling much better since our last talk.",
          unread_count: 0
        },
        {
          id: "student-4",
          name: "Taylor Reed",
          avatar_url: null,
          last_message: "The group session was really helpful yesterday.",
          unread_count: 0
        }
      ] as Student[];
    },
    enabled: !!currentUserId
  });

  useDebounce(
    () => {
      if (selectedStudent) {
        updateTypingStatus(newMessage.length > 0);
      }
    },
    500,
    [newMessage]
  );
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedStudent) return;
    sendMessage(newMessage);
    setNewMessage("");
    updateTypingStatus(false);
  };

  const selectedStudentName = students.find(s => s.id === selectedStudent)?.name || "Student";

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-bridge-primary">Messages</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Communicate with your students
        </p>
      </div>

      <Card className="bridge-card overflow-hidden">
        <div className="flex h-[calc(100vh-200px)] md:h-[600px]">
          <div className={`${
            selectedStudent ? "hidden md:block" : ""
          } w-full md:w-1/3 border-r border-bridge-muted/30`}>
            <div className="p-4 border-b border-bridge-muted/30">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-bridge-text/50" size={18} />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bridge-input"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-60px)]">
              {studentsLoading ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-bridge-text/50">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-bridge-text/50">No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center p-4 cursor-pointer hover:bg-bridge-muted/10 ${
                      selectedStudent === student.id ? "bg-bridge-muted/20" : ""
                    }`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      {student.avatar_url ? (
                        <AvatarImage src={student.avatar_url} alt={student.name} />
                      ) : (
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{student.name}</h3>
                        {student.unread_count ? (
                          <span className="bg-bridge-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {student.unread_count}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-bridge-text/70 truncate">{student.last_message || "No messages yet"}</p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          <div className={`${
            selectedStudent ? "flex" : "hidden md:flex"
          } flex-col flex-1`}>
            {selectedStudent ? (
              <>
                <div className="p-4 border-b border-bridge-muted/30">
                  <div className="flex items-center">
                    <button 
                      className="md:hidden mr-2 text-bridge-text/70"
                      onClick={() => setSelectedStudent(null)}
                    >
                      ← Back
                    </button>
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>{selectedStudentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">{selectedStudentName}</h3>
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
                          className={`flex ${message.sender_id === selectedStudent ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`flex max-w-[75%] ${message.sender_id === selectedStudent ? "" : "flex-row-reverse"}`}>
                            <div>
                              <div className={`rounded-2xl px-4 py-2 ${
                                message.sender_id === selectedStudent
                                  ? "bg-bridge-muted/20 text-bridge-text"
                                  : "bg-bridge-primary text-white"
                              }`}>
                                {message.content}
                              </div>
                              <div className={`text-xs text-bridge-text/50 mt-1 ${
                                message.sender_id === selectedStudent ? "" : "text-right"
                              }`}>
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

export default CounselorMessages;
