
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Users, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendlyUrlManager } from "@/components/CalendlyUrlManager";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CounselorDashboard = () => {
  const { user } = useAuth();
  
  // Fetch counselor profile data including Calendly URL
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('calendly_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Mock data for dashboard
  const upcomingAppointments = [
    { id: 1, date: "2025-04-25", time: "2:00 PM", student: "Alex Student" },
    { id: 2, date: "2025-04-25", time: "3:30 PM", student: "Taylor Johnson" },
  ];
  
  const pendingRequests = 2;
  const newMessages = 3;
  
  const studentConcerns = [
    { category: "Anxiety", count: 7 },
    { category: "Sleep Issues", count: 5 },
    { category: "Academic Pressure", count: 9 },
    { category: "Social Relationships", count: 4 },
  ];
  
  const recentMoodData = [
    { mood: "happy", percentage: 65 },
    { mood: "neutral", percentage: 25 },
    { mood: "sad", percentage: 10 },
  ];
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">
          Welcome, {user?.name?.split(" ")[0] || "Counselor"}
        </h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Here's an overview of your dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Calendly URL Manager */}
        <Card className="bridge-card md:col-span-2 lg:col-span-3">
          <CalendlyUrlManager currentUrl={profile?.calendly_url} />
        </Card>
        
        {/* Today's Appointments */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-bridge-primary" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{appointment.time}</p>
                      <p className="text-sm text-bridge-text/70">{appointment.student}</p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-bridge-text/70">No appointments scheduled for today</p>
            )}
            <Button asChild className="bridge-button-primary w-full">
              <Link to="/counselor/appointments">All Appointments</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Pending Requests */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-bridge-primary" />
              <span>Booking Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests > 0 ? (
              <p className="mb-4">You have <span className="font-medium">{pendingRequests} pending</span> appointment requests</p>
            ) : (
              <p className="mb-4 text-bridge-text/70">No pending requests</p>
            )}
            <Button asChild className="bridge-button-primary w-full">
              <Link to="/counselor/appointments">Review Requests</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Messages */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-bridge-primary" />
              <span>Messages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newMessages > 0 ? (
              <p className="mb-4">You have <span className="font-medium">{newMessages} unread</span> messages from students</p>
            ) : (
              <p className="mb-4 text-bridge-text/70">No new messages</p>
            )}
            <Button asChild className="bridge-button-primary w-full">
              <Link to="/counselor/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Student Concerns */}
        <Card className="bridge-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Top Student Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentConcerns.map((concern) => (
                <div key={concern.category}>
                  <div className="flex justify-between mb-1">
                    <span>{concern.category}</span>
                    <span className="text-bridge-text/70">{concern.count} students</span>
                  </div>
                  <div className="w-full bg-bridge-muted/30 rounded-full h-2.5">
                    <div 
                      className="bg-bridge-primary h-2.5 rounded-full" 
                      style={{ width: `${(concern.count / 10) * 100}%` }} 
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Student Mood Overview */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-bridge-primary" />
              <span>Student Mood</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {recentMoodData.map((item) => (
                <div key={item.mood}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="flex items-center">
                      <span className="mr-2">
                        {item.mood === "happy" ? "😊" : item.mood === "neutral" ? "😐" : "😔"}
                      </span>
                      {item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}
                    </span>
                    <span className="text-bridge-text/70">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-bridge-muted/30 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.mood === "happy" ? "bg-green-500" : 
                        item.mood === "neutral" ? "bg-yellow-500" : "bg-red-500"
                      }`} 
                      style={{ width: `${item.percentage}%` }} 
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild className="w-full">
              <Link to="/counselor/mood-insights">View Detailed Insights</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Students Overview */}
        <Card className="bridge-card md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-bridge-primary" />
              <span>Students Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-bridge-muted/30">
                <p className="text-3xl font-bold text-bridge-primary">24</p>
                <p className="text-sm text-bridge-text/70">Total Students</p>
              </div>
              <div className="p-4 rounded-2xl bg-bridge-muted/30">
                <p className="text-3xl font-bold text-bridge-primary">12</p>
                <p className="text-sm text-bridge-text/70">Recent Check-ins</p>
              </div>
              <div className="p-4 rounded-2xl bg-bridge-muted/30">
                <p className="text-3xl font-bold text-bridge-primary">8</p>
                <p className="text-sm text-bridge-text/70">Appointments This Week</p>
              </div>
              <div className="p-4 rounded-2xl bg-bridge-muted/30">
                <p className="text-3xl font-bold text-bridge-primary">18</p>
                <p className="text-sm text-bridge-text/70">Active Conversations</p>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild className="bridge-button-primary">
                <Link to="/counselor/students">View All Students</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CounselorDashboard;
