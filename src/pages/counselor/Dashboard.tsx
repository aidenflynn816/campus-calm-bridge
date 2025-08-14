import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCounselorMoodData } from "@/hooks/useCounselorMoodData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const CounselorDashboard = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  

  // Get mood data for top issue analysis
  const {
    getOverviewMetrics
  } = useCounselorMoodData(1); // Today only
  const metrics = getOverviewMetrics();

  // Fetch unread messages count
  const {
    data: unreadCount = 0
  } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      try {
        const {
          data: user
        } = await supabase.auth.getUser();
        if (!user.user) return 0;
        const {
          count,
          error
        } = await supabase.from('messages').select('*', {
          count: 'exact',
          head: true
        }).eq('recipient_id', user.user.id).is('read_at', null);
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching unread messages:', error);
        return 0;
      }
    }
  });
  return <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-bridge-primary">Counselor Dashboard</h1>
          <p className="text-lg text-bridge-text/70 mt-1">
            Welcome back, {user?.full_name || 'Counselor'}
          </p>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Unread Messages Card */}
          <Card className="bridge-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/counselor/messages')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bridge-primary mb-2">
                {unreadCount}
              </div>
              {unreadCount > 0 ? <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Needs Attention
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-bridge-text/70" />
                </div> : <p className="text-sm text-bridge-text/70">All caught up!</p>}
            </CardContent>
          </Card>

          {/* Top Issue of the Day Card */}
          <Card className="bridge-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/counselor/mood-insights')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Issue Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-bridge-primary mb-2">
                {metrics.mostCommonIssueToday || 'No issues reported'}
              </div>
              {metrics.mostCommonIssueToday && metrics.mostCommonIssueToday !== 'None' ? <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Trending
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-bridge-text/70" />
                </div> : <p className="text-sm text-bridge-text/70">Great day so far!</p>}
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <Card className="bridge-card">
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/counselor/students')}>
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Students</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/counselor/mood-insights')}>
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Mood Insights</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/counselor/messages')}>
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Messages</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/counselor/resources')}>
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Resources</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>;
};
export default CounselorDashboard;