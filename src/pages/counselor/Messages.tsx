import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare, Search, Users, Mail } from "lucide-react";
import { useMessaging } from "@/hooks/useMessaging";
import { useStudents } from "@/hooks/useStudents";
import { useDebounce } from "@/hooks/useDebounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const CounselorMessages = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { students, isLoading: studentsLoading } = useStudents();
  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    isSending,
    updateTypingStatus,
    isTyping
  } = useMessaging(selectedStudentId || '');

  useDebounce(
    () => {
      if (selectedStudentId) {
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
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedStudentId || isSending) return;
    sendMessage(newMessage);
    setNewMessage("");
    updateTypingStatus(false);
  };

  const selectedStudent = students.find(s => s.user_id === selectedStudentId);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Layout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-6"
      >
        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-bridge-primary flex items-center gap-3">
          <Mail className="text-bridge-primary" />
          Messages
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-bridge-text/70 mt-1">
          Communicate with your students and provide guidance
        </motion.p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bridge-card overflow-hidden shadow-soft">
          <div className="flex h-[calc(100vh-200px)] md:h-[600px]">
            {/* Students List */}
            <div className={`${
              selectedStudentId ? "hidden md:block" : ""
            } w-full md:w-1/3 border-r border-bridge-muted/30 bg-bridge-background/50`}>
              <div className="p-4 border-b border-bridge-muted/30 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="text-bridge-primary" size={20} />
                  <h2 className="font-semibold text-bridge-primary">Students</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bridge-text/50" size={18} />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bridge-input"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100%-100px)]">
                {studentsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 bg-bridge-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-bridge-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-bridge-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                    <Users className="h-8 w-8 text-bridge-text/30 mb-2" />
                    <p className="text-bridge-text/50">No students found</p>
                    <p className="text-sm text-bridge-text/30">Students will appear here when they register</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredStudents.map((student) => (
                      <motion.div
                        key={student.user_id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center p-4 m-1 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedStudentId === student.user_id 
                            ? "bg-bridge-primary/10 border-2 border-bridge-primary/30 shadow-md" 
                            : "hover:bg-bridge-muted/20 border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedStudentId(student.user_id)}
                      >
                        <Avatar className="h-12 w-12 mr-3 border-2 border-bridge-muted/30">
                          {student.avatar_url ? (
                            <AvatarImage src={student.avatar_url} alt={student.full_name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-bridge-secondary to-bridge-accent text-white font-semibold">
                              {student.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-bridge-primary">{student.full_name}</h3>
                          <p className="text-sm text-bridge-text/60">Student</p>
                          {student.unreadCount && student.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-bridge-primary text-white text-xs rounded-full h-5 w-5 mt-1">
                              {student.unreadCount}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className={`${
              selectedStudentId ? "flex" : "hidden md:flex"
            } flex-col flex-1 bg-gradient-to-b from-white to-bridge-background/30`}>
              {selectedStudentId ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-bridge-muted/30 bg-white/90 backdrop-blur">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="md:hidden mr-2 text-bridge-text/70 hover:text-bridge-primary"
                        onClick={() => setSelectedStudentId(null)}
                      >
                        ← Back
                      </Button>
                      <Avatar className="h-10 w-10 mr-3 border-2 border-bridge-muted/30">
                        {selectedStudent?.avatar_url ? (
                          <AvatarImage src={selectedStudent.avatar_url} alt={selectedStudent.full_name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-bridge-secondary to-bridge-accent text-white font-semibold">
                            {selectedStudent?.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-bridge-primary">
                          {selectedStudent?.full_name}
                        </h3>
                        {isTyping && (
                          <p className="text-sm text-bridge-text/70 animate-pulse">typing...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse flex items-center gap-2">
                          <div className="w-3 h-3 bg-bridge-primary rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-bridge-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-bridge-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-bridge-muted/20 rounded-full p-4 mb-4">
                          <MessageSquare className="h-12 w-12 text-bridge-primary/60" />
                        </div>
                        <h3 className="text-lg font-semibold text-bridge-primary mb-2">Start a conversation</h3>
                        <p className="text-bridge-text/50 max-w-sm">
                          Send a message to {selectedStudent?.full_name} to begin the conversation
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isCurrentUser = message.sender_id === user?.id;
                          const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                          
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`flex max-w-[75%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                                {showAvatar && (
                                  <Avatar className="h-8 w-8 mr-2 border border-bridge-muted/30">
                                    <AvatarFallback className="bg-gradient-to-br from-bridge-secondary to-bridge-accent text-white text-sm">
                                      {selectedStudent?.full_name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className={showAvatar ? '' : 'ml-10'}>
                                  <div
                                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                                      isCurrentUser
                                        ? "bg-gradient-to-r from-bridge-primary to-bridge-secondary text-white"
                                        : "bg-white border border-bridge-muted/30 text-bridge-text"
                                    }`}
                                  >
                                    {message.content}
                                  </div>
                                  <div
                                    className={`text-xs text-bridge-text/50 mt-1 ${
                                      isCurrentUser ? "text-right" : ""
                                    }`}
                                  >
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-bridge-muted/30 bg-white/90 backdrop-blur">
                    <form 
                      className="flex items-center space-x-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    >
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${selectedStudent?.full_name}...`}
                        className="bridge-input flex-1"
                        disabled={isSending}
                      />
                      <Button 
                        type="submit"
                        className="bridge-button-primary px-6" 
                        disabled={newMessage.trim() === "" || isSending}
                      >
                        {isSending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-bridge-text/50">
                  <div className="bg-bridge-muted/20 rounded-full p-6 mb-4">
                    <MessageSquare className="h-16 w-16 text-bridge-primary/60" />
                  </div>
                  <h3 className="text-xl font-semibold text-bridge-primary mb-2">No conversation selected</h3>
                  <p className="text-center max-w-sm">Choose a student from the list to start a conversation</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default CounselorMessages;
