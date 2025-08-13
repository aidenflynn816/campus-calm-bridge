import { useState } from "react";
import { MessageSquare, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useCounselors } from "@/hooks/useCounselors";
import { useMessaging } from "@/hooks/useMessaging";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";

export default function StudentCounselors() {
  const { counselors, isLoading } = useCounselors();
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>("");
  const [messageContent, setMessageContent] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  const { sendMessage, isSending } = useMessaging(selectedCounselorId);
  const { createAppointment } = useAppointments();

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
  ];

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedCounselorId) return;
    
    try {
      sendMessage(messageContent);
      setMessageContent("");
      setMessageDialogOpen(false);
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleBookAppointment = async () => {
    if (!appointmentDate || !appointmentTime || !selectedCounselorId) return;
    
    try {
      await createAppointment.mutateAsync({
        counselor_id: selectedCounselorId,
        date: appointmentDate,
        time: appointmentTime,
        reason: appointmentReason
      });
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentReason("");
      setAppointmentDialogOpen(false);
      toast.success("Appointment request sent!");
    } catch (error) {
      toast.error("Failed to book appointment");
    }
  };

  const openMessageDialog = (counselorId: string) => {
    setSelectedCounselorId(counselorId);
    setMessageDialogOpen(true);
  };

  const openAppointmentDialog = (counselorId: string) => {
    setSelectedCounselorId(counselorId);
    setAppointmentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading counselors...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Counselors</h1>
          <p className="text-muted-foreground">
            Connect with our professional counselors for support and guidance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counselors.map((counselor) => (
            <Card key={counselor.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={counselor.avatar_url} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{counselor.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => openMessageDialog(counselor.user_id)}
                    variant="outline" 
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    onClick={() => openAppointmentDialog(counselor.user_id)}
                    className="flex-1"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setMessageDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || isSending}
                >
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Appointment Dialog */}
        <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Brief description of what you'd like to discuss..."
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setAppointmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBookAppointment}
                  disabled={!appointmentDate || !appointmentTime || createAppointment.isPending}
                >
                  {createAppointment.isPending ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}