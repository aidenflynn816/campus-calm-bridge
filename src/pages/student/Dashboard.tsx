
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, BookOpen, SmilePlus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMoodCheckins, MOOD_OPTIONS } from "@/hooks/useMoodCheckins";
import { format } from "date-fns";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { moodCheckins, todayCheckin, getMoodTrendData } = useMoodCheckins();
  
  // Mock data for dashboard
  const upcomingAppointment = {
    date: "2025-04-28",
    time: "3:00 PM",
    counselor: "Dr. Jamie Counselor",
  };
  
  // Get recent mood history (last 7 days)
  const recentMoodHistory = getMoodTrendData(7);
  
  // Calculate mood streak (consecutive days with check-ins)
  const calculateMoodStreak = () => {
    if (moodCheckins.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasCheckin = moodCheckins.some(checkin => {
        const checkinDate = new Date(checkin.created_at);
        return checkinDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasCheckin) {
        streak++;
      } else if (i > 0) { // Don't break on first day if no checkin today
        break;
      }
    }
    
    return streak;
  };
  
  const moodStreak = calculateMoodStreak();
  const newMessages = 2;
  
  const recommendedResources = [
    { id: 1, title: "Managing Exam Stress", category: "Stress" },
    { id: 2, title: "Healthy Sleep Patterns", category: "Wellness" },
    { id: 3, title: "Mindfulness Practices", category: "Mindfulness" },
  ];
  
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
            {todayCheckin ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{todayCheckin.mood_emoji}</span>
                  <div>
                    <p className="font-medium">
                      {MOOD_OPTIONS.find(option => option.rating === todayCheckin.mood_rating)?.label}
                    </p>
                    <p className="text-sm text-bridge-text/60">
                      Checked in at {format(new Date(todayCheckin.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
                {moodStreak > 1 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      {moodStreak} day streak!
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-bridge-text/70">How are you feeling today?</p>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.slice(0, 3).map((option) => (
                    <Button 
                      key={option.rating}
                      variant="outline" 
                      className="flex-1 h-12 text-2xl"
                      asChild
                    >
                      <Link to="/student/mood">{option.emoji}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Button asChild className="bridge-button-primary w-full mt-4">
              <Link to="/student/mood">
                {todayCheckin ? "View Details" : "Check In"}
              </Link>
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
            <CardTitle className="flex items-center justify-between">
              <span>Recent Mood History</span>
              {moodStreak > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {moodStreak} day streak
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMoodHistory.length > 0 ? (
              <div className="flex justify-between items-center">
                {recentMoodHistory.slice(-7).map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-2xl mb-1">{day.emoji}</div>
                    <div className="text-xs text-bridge-text/70">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-bridge-text/60">
                <p>No mood data yet</p>
                <p className="text-sm">Start tracking your mood to see patterns!</p>
              </div>
            )}
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
