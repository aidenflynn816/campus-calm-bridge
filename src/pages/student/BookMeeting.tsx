import { useState } from "react";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";
import { useAvailability } from "@/hooks/useGoogleCalendar";
import { useCounselors } from "@/hooks/useCounselors";

const BookMeeting = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  const { createAppointment } = useAppointments();
  const { user } = useAuth();
  const { counselors } = useCounselors();
  
  // Get dynamic availability for selected counselor and date
  const { data: availabilityData, isLoading: isLoadingAvailability } = useAvailability(
    selectedCounselor || '', 
    date ? date.toISOString().split('T')[0] : ''
  );
  
  // Get available time slots from API or fallback to default
  const availableTimes = availabilityData?.availableSlots || [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
  ];
  
  const handleSubmit = async () => {
    if (!date || !selectedTime || !reason || !selectedCounselor) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      await createAppointment.mutateAsync({
        counselor_id: selectedCounselor,
        date: date.toISOString().split('T')[0],
        time: selectedTime,
        reason
      });

      // Reset form
      setDate(undefined);
      setSelectedTime(null);
      setReason("");
      setSelectedCounselor(null);
    } catch (error) {
      // Error is handled in the mutation
    }
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">Book a Meeting</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Schedule time with a counselor
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar section */}
        <Card className="bridge-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>Choose when you'd like to meet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Date</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-2xl border"
                  disabled={(date) => 
                    date < new Date() || // Can't book in the past
                    date.getDay() === 0 || // Can't book on Sunday
                    date.getDay() === 6 // Can't book on Saturday
                  }
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Available Times</h3>
                  {availabilityData?.calendarConnected && (
                    <span className="text-sm text-bridge-text/70 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Calendar connected
                    </span>
                  )}
                </div>
                {date ? (
                  isLoadingAvailability ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-10 bg-bridge-muted/20 animate-pulse rounded-xl"></div>
                      ))}
                    </div>
                  ) : availableTimes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`rounded-xl ${
                            selectedTime === time 
                              ? "bg-bridge-primary text-white" 
                              : "hover:bg-bridge-accent/20"
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-bridge-muted/20 rounded-2xl">
                      <p className="text-bridge-text/70">No available time slots for this date</p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-40 bg-bridge-muted/20 rounded-2xl">
                    <p className="text-bridge-text/70">Please select a date first</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Reason for Meeting</h3>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe what you'd like to discuss..."
                className="bridge-input resize-none"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Counselor selection and submission */}
        <div className="space-y-6">
          <Card className="bridge-card">
            <CardHeader>
              <CardTitle>Select Counselor</CardTitle>
              <CardDescription>Choose who you'd like to meet with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {counselors.map((counselor) => (
                  <div 
                    key={counselor.id} 
                    className={`flex items-center space-x-3 p-3 rounded-2xl hover:bg-bridge-muted/20 cursor-pointer border ${
                      selectedCounselor === counselor.user_id 
                        ? "border-bridge-primary bg-bridge-accent/10" 
                        : "border-bridge-muted/30"
                    }`}
                    onClick={() => setSelectedCounselor(counselor.user_id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-bridge-accent flex items-center justify-center text-bridge-primary font-medium">
                      {counselor.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{counselor.full_name}</p>
                      <p className="text-sm text-bridge-text/70">Available for appointments</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bridge-card">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-bridge-text/70">Date</p>
                  <p className="font-medium">
                    {date ? date.toLocaleDateString() : "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-bridge-text/70">Time</p>
                  <p className="font-medium">{selectedTime || "Not selected"}</p>
                </div>
                <div>
                  <p className="text-sm text-bridge-text/70">Counselor</p>
                  <p className="font-medium">{selectedCounselor ? counselors.find(c => c.user_id === selectedCounselor)?.full_name : "Not selected"}</p>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit} 
                className="bridge-button-primary w-full"
                disabled={!date || !selectedTime || !reason || !selectedCounselor}
              >
                Request Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookMeeting;
