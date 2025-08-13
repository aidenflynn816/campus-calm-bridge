import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCounselors } from "@/hooks/useCounselors";

// Define counselors with their Calendly links
const counselorsData = [
  { 
    id: "1", 
    name: "Dr. Jamie Counselor", 
    specialty: "Anxiety, Depression",
    calendlyUrl: "https://calendly.com/dr-jamie-counselor" // Replace with actual Calendly URL
  },
  { 
    id: "2", 
    name: "Dr. Jordan Smith", 
    specialty: "Academic Stress, Relationships",
    calendlyUrl: "https://calendly.com/dr-jordan-smith" // Replace with actual Calendly URL
  },
];

const BookMeeting = () => {
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  const { counselors: dbCounselors, isLoading } = useCounselors();
  
  // Use database counselors if available, fallback to static data
  const counselors = dbCounselors.length > 0 
    ? dbCounselors.map(c => ({
        id: c.id,
        name: c.full_name,
        specialty: "Mental Health Counseling", // Default specialty
        calendlyUrl: `https://calendly.com/${c.full_name.toLowerCase().replace(/\s+/g, '-')}` // Generated URL - should be configured per counselor
      }))
    : counselorsData;

  const selectedCounselorData = counselors.find(c => c.id === selectedCounselor);

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">Book a Meeting</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Schedule time with a counselor
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendly Widget section */}
        <Card className="bridge-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Schedule Your Appointment</CardTitle>
            <CardDescription>
              {selectedCounselorData 
                ? `Book directly with ${selectedCounselorData.name}` 
                : "Select a counselor to see their available times"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCounselorData ? (
              <div className="min-h-[600px]">
                <div 
                  className="calendly-inline-widget" 
                  data-url={selectedCounselorData.calendlyUrl}
                  style={{ minWidth: '320px', height: '600px' }}
                ></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-bridge-muted/20 rounded-2xl">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-bridge-text mb-2">Select a Counselor</h3>
                  <p className="text-bridge-text/70">Choose a counselor from the list to view their calendar and book an appointment</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Counselor selection */}
        <div className="space-y-6">
          <Card className="bridge-card">
            <CardHeader>
              <CardTitle>Select Counselor</CardTitle>
              <CardDescription>Choose who you'd like to meet with</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 rounded-full bg-bridge-muted/30 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-bridge-muted/30 rounded animate-pulse mb-1"></div>
                        <div className="h-3 bg-bridge-muted/20 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {counselors.map((counselor) => (
                    <div 
                      key={counselor.id} 
                      className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer border transition-all ${
                        selectedCounselor === counselor.id 
                          ? "bg-bridge-primary/10 border-bridge-primary/30" 
                          : "hover:bg-bridge-muted/20 border-bridge-muted/30"
                      }`}
                      onClick={() => setSelectedCounselor(counselor.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-bridge-accent flex items-center justify-center text-bridge-primary font-medium">
                        {counselor.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{counselor.name}</p>
                        <p className="text-sm text-bridge-text/70">{counselor.specialty}</p>
                      </div>
                      {selectedCounselor === counselor.id && (
                        <div className="w-3 h-3 rounded-full bg-bridge-primary"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bridge-card">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-bridge-text/70">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-bridge-primary/20 flex items-center justify-center text-xs font-medium text-bridge-primary mt-0.5">1</div>
                  <p>Select a counselor from the list above</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-bridge-primary/20 flex items-center justify-center text-xs font-medium text-bridge-primary mt-0.5">2</div>
                  <p>Choose an available time slot from their calendar</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-bridge-primary/20 flex items-center justify-center text-xs font-medium text-bridge-primary mt-0.5">3</div>
                  <p>Complete the booking form with your details</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-bridge-primary/20 flex items-center justify-center text-xs font-medium text-bridge-primary mt-0.5">4</div>
                  <p>Receive confirmation and calendar invite via email</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookMeeting;
