
import { useState } from "react";
import Layout from "../../components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useDebounce } from "@/hooks/useDebounce";
import { ScrollArea } from "@/components/ui/scroll-area";

const CounselorMessages = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  const {
    messages,
    isLoading,
    sendMessage,
    updateTypingStatus,
    isTyping
  } = useMessages(selectedStudent || '');

  // Debounce typing status updates
  useDebounce(
    () => {
      if (selectedStudent) {
        updateTypingStatus(newMessage.length > 0);
      }
    },
    500,
    [newMessage]
  );

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedStudent) return;
    sendMessage(newMessage);
    setNewMessage("");
    updateTypingStatus(false);
  };

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
          {/* Students List */}
          <div className={`${
            selectedStudent ? "hidden md:block" : ""
          } w-full md:w-1/3 border-r border-bridge-muted/30`}>
            <div className="p-4 border-b border-bridge-muted/30">
              <h2 className="font-medium">Conversations</h2>
            </div>
            
            <ScrollArea className="h-[calc(100%-60px)]">
              {/* TODO: Add student list from counselor_student_relationships table */}
              <div
                className="flex items-center p-4 cursor-pointer hover:bg-bridge-muted/10"
                onClick={() => setSelectedStudent("sample-student-id")}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">John Student</h3>
                  <p className="text-sm text-bridge-text/70">Sample message</p>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
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
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">John Student</h3>
                  </div>
                  {isTyping && (
                    <p className="text-sm text-bridge-text/70 mt-1">typing...</p>
                  )}
                </div>

                <ScrollArea className="flex-1 p-4">
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
                              {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
