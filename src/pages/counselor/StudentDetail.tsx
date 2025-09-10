import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Calendar, TrendingUp, Shield, Clock, Star, StarOff } from "lucide-react";
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useStudents } from "../../hooks/useStudents";
import { useMoodCheckins } from "../../hooks/useMoodCheckins";
import { useAppointments } from "../../hooks/useAppointments";
import { useDataSharingRequests } from "../../hooks/useDataSharingRequests";
import { useCounselorStudents } from "../../hooks/useCounselorStudents";
import MoodChart from "../../components/MoodChart";

import { useToast } from "../../hooks/use-toast";

const StudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { students } = useStudents();
  const { moodCheckins, getMoodTrendData } = useMoodCheckins(studentId && studentId !== ':studentId' ? studentId : undefined);
  const { appointments } = useAppointments();
  const { 
    createRequest, 
    getRequestByStudentId, 
    isLoading: requestLoading 
  } = useDataSharingRequests();
  const { isManuallyAssigned, addStudent, removeStudent, isAddingStudent, isRemovingStudent } = useCounselorStudents();

  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  const student = students.find(s => s.user_id === studentId);
  const existingRequest = studentId ? getRequestByStudentId(studentId) : null;
  
  // Check if we have approved access
  const hasApprovedAccess = existingRequest?.status === 'approved';
  const studentMoods = hasApprovedAccess ? moodCheckins : [];
  
  const studentAppointments = appointments.filter(apt => apt.student_id === studentId);

  const handleRequestAccess = async () => {
    if (!studentId) return;

    try {
      await createRequest(studentId, requestMessage);
      setShowRequestForm(false);
      setRequestMessage("");
      toast({
        title: "Request sent",
        description: "The student will be notified about your data access request.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStudentStats = () => {
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
      lastCheckin: recentMood ? new Date(recentMood.created_at).toLocaleDateString() : 'No data available'
    };
  };

  const getMoodColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating === 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (!student) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Student not found</h1>
          <Button onClick={() => navigate('/counselor/students')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </Layout>
    );
  }

  const stats = getStudentStats();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/counselor/students')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary">Student Profile</h1>
            <p className="text-muted-foreground">View student information and mood data</p>
          </div>
        </div>

        {/* Student Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.avatar_url} />
                  <AvatarFallback>
                    {student.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">{student.full_name || 'Unknown Student'}</h2>
                    {isManuallyAssigned(studentId || '') && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <Star className="w-3 h-3 mr-1" />
                        My Student
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Last check-in: {stats.lastCheckin}</span>
                    <span>•</span>
                    <span>{stats.totalMoodCheckins} mood entries</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {stats.recentMood && hasApprovedAccess && (
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

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{hasApprovedAccess ? stats.totalMoodCheckins : '•••'} mood entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{stats.upcomingAppointments} upcoming appointments</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => studentId && (isManuallyAssigned(studentId) ? removeStudent(studentId) : addStudent(studentId))}
                  disabled={isAddingStudent || isRemovingStudent}
                >
                  {isManuallyAssigned(studentId || '') ? (
                    <>
                      <StarOff className="h-4 w-4 mr-1" />
                      Remove from My Students
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-1" />
                      Add to My Students
                    </>
                  )}
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

        {/* Data Access Status */}
        {!hasApprovedAccess && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Mood Data Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!existingRequest && (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      To view this student's mood data, you need to request permission. 
                      The student will be notified and can approve or deny your request.
                    </AlertDescription>
                  </Alert>
                  
                  {!showRequestForm ? (
                    <Button onClick={() => setShowRequestForm(true)}>
                      Request Mood Data Access
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Optional: Add a message explaining why you need access to their mood data..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleRequestAccess}
                          disabled={requestLoading}
                        >
                          Send Request
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRequestForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {existingRequest && existingRequest.status === 'pending' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your request for mood data access is pending. The student will be notified to approve or deny your request.
                  </AlertDescription>
                </Alert>
              )}

              {existingRequest && existingRequest.status === 'denied' && (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your request for mood data access was denied by the student.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mood Data (only if approved) */}
        {hasApprovedAccess && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <MoodChart 
                data={getMoodTrendData(30)} 
                title="30-Day Mood Trends"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Mood Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentMoods.slice(0, 5).map((mood) => (
                    <div key={mood.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mood.mood_emoji}</span>
                        <div>
                          <p className="font-medium">{mood.mood_rating}/5</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(mood.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {mood.notes && (
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {mood.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {studentMoods.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No mood entries available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.reason || 'General consultation'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </p>
                  </div>
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              {studentAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No appointments scheduled
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StudentDetail;