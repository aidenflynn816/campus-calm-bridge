
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BookOpen, SmilePlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMoodCheckins, MOOD_OPTIONS } from "@/hooks/useMoodCheckins";
import { useResources } from "@/hooks/useResources";
import { DataSharingNotifications } from "../../components/DataSharingNotifications";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { todayCheckin } = useMoodCheckins();
  const { resources } = useResources();

  // Fetch unread messages count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return 0;
        
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.user.id)
          .is('read_at', null);
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching unread messages:', error);
        return 0;
      }
    }
  });

  // Get featured/recommended resources (limited to 3)
  const recommendedResources = resources
    .filter(resource => resource.featured)
    .slice(0, 3);

  return (
    <Layout>
      <div className="mb-6">
        <DataSharingNotifications />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">
          Welcome, {user?.full_name?.split(" ")[0] || "Student"}
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
                  {(() => {
                    const moodOption = MOOD_OPTIONS.find(option => option.rating === todayCheckin.mood_rating);
                    return moodOption ? (
                      <div className={`p-3 rounded-lg ${moodOption.bgColor}/10 border border-${moodOption.color.replace('text-', '')}/20`}>
                        <moodOption.icon size={32} className={moodOption.color} />
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <p className="font-medium">
                      {MOOD_OPTIONS.find(option => option.rating === todayCheckin.mood_rating)?.label}
                    </p>
                    <p className="text-sm text-bridge-text/60">
                      Checked in at {format(new Date(todayCheckin.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">✅ Check-in completed!</p>
                  <p className="text-xs text-green-600">Great job tracking your mood today.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-bridge-text/70">How are you feeling today?</p>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.slice(0, 3).map((option) => (
                    <Button 
                      key={option.rating}
                      variant="outline" 
                      className={`flex-1 h-12 hover:${option.bgColor}/10 hover:border-${option.color.replace('text-', '')}/30 transition-all`}
                      asChild
                    >
                      <Link to="/student/mood" className="flex items-center justify-center">
                        <option.icon size={24} className={option.color} />
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Button asChild className="bridge-button-primary w-full mt-4">
              <Link to="/student/mood">
                {todayCheckin ? "View Details" : "Check In Now"}
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Unread Messages */}
        <Card className="bridge-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/student/messages'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bridge-primary mb-2">
              {unreadCount}
            </div>
            {unreadCount > 0 ? (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  Unread
                </Badge>
                <ArrowRight className="h-4 w-4 text-bridge-text/70" />
              </div>
            ) : (
              <p className="text-sm text-bridge-text/70">All caught up!</p>
            )}
          </CardContent>
        </Card>

        {/* Recommended Resources */}
        <Card className="bridge-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-bridge-primary" />
              <span>Recommended Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendedResources.length > 0 ? (
              <ul className="space-y-3 mb-4">
                {recommendedResources.map((resource) => (
                  <li key={resource.id}>
                    <Link 
                      to={`/student/resources`}
                      className="group flex items-center space-x-3 hover:bg-bridge-accent/5 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-bridge-accent/20 flex items-center justify-center">
                        <BookOpen size={18} className="text-bridge-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-bridge-primary text-sm">
                          {resource.title}
                        </p>
                        <p className="text-xs text-bridge-text/70">{resource.category}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-bridge-text/40 group-hover:text-bridge-primary transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-bridge-text/60">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-bridge-text/40" />
                <p className="text-sm">No resources available yet</p>
              </div>
            )}
            <Button asChild className="w-full" variant="outline">
              <Link to="/student/resources">Browse All Resources</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
