
import { useState } from "react";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BookMeeting = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  
  // Mock data for available counselors and time slots
  const counselors = [
    { id: 1, name: "Dr. Jamie Counselor", specialty: "Anxiety, Depression" },
    { id: 2, name: "Dr. Jordan Smith", specialty: "Academic Stress, Relationships" },
  ];
  
  const availableTimes = [
    "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", 
    "2:00 PM", "3:00 PM", "4:00 PM"
  ];
  
  const handleSubmit = () => {
    if (!date || !selectedTime || !reason) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Here we would normally send this data to the Supabase backend
    toast.success("Appointment request sent!");
    
    // Reset form
    setDate(undefined);
    setSelectedTime(null);
    setReason("");
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
                <h3 className="text-lg font-medium mb-3">Available Times</h3>
                {date ? (
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
                    className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-bridge-muted/20 cursor-pointer border border-bridge-muted/30"
                    onClick={() => {}}
                  >
                    <div className="w-10 h-10 rounded-full bg-bridge-accent flex items-center justify-center text-bridge-primary font-medium">
                      {counselor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{counselor.name}</p>
                      <p className="text-sm text-bridge-text/70">{counselor.specialty}</p>
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
                  <p className="font-medium">{counselors[0].name}</p>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit} 
                className="bridge-button-primary w-full"
                disabled={!date || !selectedTime || !reason}
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
