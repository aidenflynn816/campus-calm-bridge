import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, MessageCircle, TrendingUp, Search, Filter, Star, StarOff } from "lucide-react";
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
import { useCounselorStudents } from "../../hooks/useCounselorStudents";
const StudentList = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    students,
    isLoading
  } = useStudents();
  const {
    moodCheckins
  } = useMoodCheckins();
  const {
    appointments
  } = useAppointments();
  const {
    isManuallyAssigned,
    addStudent,
    removeStudent,
    isAddingStudent,
    isRemovingStudent
  } = useCounselorStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

    // Filter by student relationship - only use manual assignments
    const matchesStudentFilter = studentFilter === "all" || studentFilter === "my-students" && isManuallyAssigned(student.user_id);
    return matchesSearch && matchesStudentFilter;
  });
  const getStudentStats = (studentId: string) => {
    const studentMoods = moodCheckins.filter(checkin => checkin.user_id === studentId);
    const studentAppointments = appointments.filter(apt => apt.student_id === studentId);
    const recentMood = studentMoods.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const upcomingAppointments = studentAppointments.filter(apt => {
      const aptDate = new Date(`${apt.date}T${apt.time}`);
      return aptDate > new Date() && (apt.status === 'confirmed' || apt.status === 'pending');
    }).length;
    return {
      totalMoodCheckins: studentMoods.length,
      recentMood,
      upcomingAppointments,
      lastCheckin: recentMood ? new Date(recentMood.created_at).toLocaleDateString() : 'Never'
    };
  };
  const getMoodColor = (rating: number) => {
    if (rating >= 4) return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    if (rating === 3) return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950";
    return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
  };
  if (isLoading) {
    return <Layout>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </Layout>;
  }
  return <Layout>
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
                <Input placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="my-students">My Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents.length === 0 ? <Card>
              <CardContent className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No students found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || studentFilter !== "all" ? "Try adjusting your search or filters" : "No students found"}
                </p>
              </CardContent>
            </Card> : filteredStudents.map(student => {
          const stats = getStudentStats(student.user_id);
          return <Card key={student.id} className="hover:shadow-md transition-shadow">
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold truncate">
                              {student.full_name || 'Unknown Student'}
                            </h3>
                            {isManuallyAssigned(student.user_id) && <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                                <Star className="w-3 h-3 mr-1" />
                                My Student
                              </Badge>}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Last check-in: {stats.lastCheckin}</span>
                            <span>•</span>
                            <span>{stats.totalMoodCheckins} mood entries</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        {stats.recentMood && <Badge variant="secondary" className={`${getMoodColor(stats.recentMood.mood_rating)} border-0`}>
                            {stats.recentMood.mood_emoji} {stats.recentMood.mood_rating}/5
                          </Badge>}
                        
                        {stats.upcomingAppointments > 0 && <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {stats.upcomingAppointments} upcoming
                          </Badge>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          
                          
                        </div>
                        
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => isManuallyAssigned(student.user_id) ? removeStudent(student.user_id) : addStudent(student.user_id)} disabled={isAddingStudent || isRemovingStudent}>
                          {isManuallyAssigned(student.user_id) ? <>
                              <StarOff className="h-3 w-3 mr-1" />
                              Remove
                            </> : <>
                              <Star className="h-3 w-3 mr-1" />
                              Add
                            </>}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/counselor/students/${student.user_id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>;
        })}
        </div>
      </div>
    </Layout>;
};
export default StudentList;