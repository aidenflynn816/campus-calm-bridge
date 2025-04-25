
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, BookOpen, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudentDashboard = () => {
  const { user } = useAuth();
  
  // Mock data for dashboard
  const upcomingAppointment = {
    date: "2025-04-28",
    time: "3:00 PM",
    counselor: "Dr. Jamie Counselor",
  };
  
  const moodHistory = [
    { date: "2025-04-24", mood: "happy" },
    { date: "2025-04-23", mood: "neutral" },
    { date: "2025-04-22", mood: "sad" },
    { date: "2025-04-21", mood: "happy" },
    { date: "2025-04-20", mood: "happy" },
  ];
  
  const newMessages = 2;
  
  const recommendedResources = [
    { id: 1, title: "Managing Exam Stress", category: "Stress" },
    { id: 2, title: "Healthy Sleep Patterns", category: "Wellness" },
    { id: 3, title: "Mindfulness Practices", category: "Mindfulness" },
  ];
  
  // Function to render mood emoji
  const renderMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "neutral":
        return "😐";
      case "sad":
        return "😔";
      default:
        return "❓";
    }
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">
          Welcome, {user?.name?.split(" ")[0] || "Student"}
        </h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          How are you feeling today?
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Check-in */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <SmilePlus className="h-5 w-5 text-bridge-primary" />
              <span>Daily Mood Check-in</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-bridge-text/70">How are you feeling today?</p>
            <div className="flex justify-between mb-6">
              <Button variant="outline" className="rounded-2xl hover:bg-bridge-accent/20 flex-1 mx-1">😊</Button>
              <Button variant="outline" className="rounded-2xl hover:bg-bridge-accent/20 flex-1 mx-1">😐</Button>
              <Button variant="outline" className="rounded-2xl hover:bg-bridge-accent/20 flex-1 mx-1">😔</Button>
            </div>
            <Button asChild className="bridge-button-primary w-full">
              <Link to="/student/mood">Check In</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Upcoming Appointment */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-bridge-primary" />
              <span>Upcoming Appointment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointment ? (
              <div className="mb-4">
                <p className="font-medium">{upcomingAppointment.date} at {upcomingAppointment.time}</p>
                <p className="text-bridge-text/70">With {upcomingAppointment.counselor}</p>
              </div>
            ) : (
              <p className="mb-4 text-bridge-text/70">No upcoming appointments</p>
            )}
            <div className="flex space-x-3">
              <Button asChild variant="outline" className="w-1/2">
                <Link to="/student/appointments">View All</Link>
              </Button>
              <Button asChild className="bridge-button-primary w-1/2">
                <Link to="/student/book">Book Meeting</Link>
              </Button>
            </div>
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
              <p className="mb-4">You have <span className="font-medium">{newMessages} unread</span> messages</p>
            ) : (
              <p className="mb-4 text-bridge-text/70">No new messages</p>
            )}
            <Button asChild className="bridge-button-primary w-full">
              <Link to="/student/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Mood History */}
        <Card className="bridge-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Recent Mood History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              {moodHistory.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-2xl mb-1">{renderMoodEmoji(day.mood)}</div>
                  <div className="text-xs text-bridge-text/70">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/student/mood">View Full History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Resources */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-bridge-primary" />
              <span>Resources For You</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-4">
              {recommendedResources.map((resource) => (
                <li key={resource.id}>
                  <a href="#" className="group flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-bridge-accent/20 flex items-center justify-center">
                      <BookOpen size={18} className="text-bridge-primary" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-bridge-primary">{resource.title}</p>
                      <p className="text-xs text-bridge-text/70">{resource.category}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full">
              <Link to="/student/resources">Browse All Resources</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
