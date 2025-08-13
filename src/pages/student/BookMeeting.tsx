import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useCounselors } from "@/hooks/useCounselors";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const BookMeeting = () => {
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  
  // Fetch counselors with their Calendly URLs from the database
  const { data: counselors = [], isLoading } = useQuery({
    queryKey: ['counselors-with-calendly'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, calendly_url')
        .eq('role', 'counselor')
        .order('full_name', { ascending: true });

      if (error) throw error;

      return (data || []).map(counselor => ({
        id: counselor.id,
        name: counselor.full_name || 'Unknown Counselor',
        specialty: "Mental Health Counseling", // Default specialty
        calendlyUrl: counselor.calendly_url || null,
        hasCalendlyUrl: !!counselor.calendly_url
      }));
    },
  });

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
            {selectedCounselorData?.calendlyUrl ? (
              <div className="min-h-[600px]">
                <div 
                  className="calendly-inline-widget" 
                  data-url={selectedCounselorData.calendlyUrl}
                  style={{ minWidth: '320px', height: '600px' }}
                ></div>
              </div>
            ) : selectedCounselorData ? (
              <div className="flex items-center justify-center h-96 bg-bridge-muted/20 rounded-2xl">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto text-bridge-text/50 mb-4" />
                  <h3 className="text-lg font-medium text-bridge-text mb-2">Calendly Not Available</h3>
                  <p className="text-bridge-text/70">
                    {selectedCounselorData.name} hasn't set up their Calendly link yet.
                    Please contact them directly or choose another counselor.
                  </p>
                </div>
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
                        {!counselor.hasCalendlyUrl && (
                          <p className="text-xs text-amber-600 font-medium">⚠️ Calendly not configured</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {counselor.hasCalendlyUrl && (
                          <div className="w-2 h-2 rounded-full bg-green-500" title="Calendly available"></div>
                        )}
                        {selectedCounselor === counselor.id && (
                          <div className="w-3 h-3 rounded-full bg-bridge-primary"></div>
                        )}
                      </div>
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
