
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, MessageCircle, TrendingUp, Search, Filter } from "lucide-react";
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useStudents } from "../../hooks/useStudents";
import { useMoodCheckins } from "../../hooks/useMoodCheckins";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../contexts/AuthContext";

const StudentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, isLoading } = useStudents();
  const { moodCheckins } = useMoodCheckins();
  const { appointments } = useAppointments();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moodFilter, setMoodFilter] = useState("all");

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    
    // Get recent mood for this student
    const recentMood = moodCheckins
      .filter(checkin => checkin.user_id === student.user_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    const matchesMoodFilter = moodFilter === "all" || 
      (moodFilter === "positive" && recentMood && recentMood.mood_rating >= 4) ||
      (moodFilter === "neutral" && recentMood && recentMood.mood_rating === 3) ||
      (moodFilter === "negative" && recentMood && recentMood.mood_rating <= 2) ||
      (moodFilter === "no-data" && !recentMood);

    return matchesSearch && matchesMoodFilter;
  });

  const getStudentStats = (studentId: string) => {
    const studentMoods = moodCheckins.filter(checkin => checkin.user_id === studentId);
    const studentAppointments = appointments.filter(apt => apt.student_id === studentId);
    
    const recentMood = studentMoods
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    const upcomingAppointments = studentAppointments.filter(apt => {
      const aptDate = new Date(`${apt.date}T${apt.time}`);
      return aptDate > new Date() && apt.status === 'confirmed';
    }).length;

    return {
      totalMoodCheckins: studentMoods.length,
      recentMood,
      upcomingAppointments,
      lastCheckin: recentMood ? new Date(recentMood.created_at).toLocaleDateString() : 'Never'
    };
  };

  const getMoodColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating === 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Students</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and support your assigned students
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredStudents.length} students
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={moodFilter} onValueChange={setMoodFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All moods</SelectItem>
                  <SelectItem value="positive">Positive (4-5)</SelectItem>
                  <SelectItem value="neutral">Neutral (3)</SelectItem>
                  <SelectItem value="negative">Negative (1-2)</SelectItem>
                  <SelectItem value="no-data">No recent data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No students found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || moodFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "No students have been assigned to you yet"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => {
              const stats = getStudentStats(student.user_id);
              
              return (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback>
                            {student.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            {student.full_name || 'Unknown Student'}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Last check-in: {stats.lastCheckin}</span>
                            <span>•</span>
                            <span>{stats.totalMoodCheckins} mood entries</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        {stats.recentMood && (
                          <Badge 
                            variant="secondary" 
                            className={`${getMoodColor(stats.recentMood.mood_rating)} border-0`}
                          >
                            {stats.recentMood.mood_emoji} {stats.recentMood.mood_rating}/5
                          </Badge>
                        )}
                        
                        {stats.upcomingAppointments > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            {stats.upcomingAppointments} upcoming
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{stats.totalMoodCheckins} entries</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{stats.upcomingAppointments} upcoming</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/counselor/students/${student.user_id}`)}
                        >
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentList;
