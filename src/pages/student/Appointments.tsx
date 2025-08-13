import Layout from "../../components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/useAppointments";
import { useCounselors } from "@/hooks/useCounselors";
import { Link } from "react-router-dom";

// Define getStatusBadge outside of components so it's accessible to all
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-500">Pending</Badge>;
    case "confirmed":
      return <Badge className="bg-green-500">Confirmed</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "completed":
      return <Badge variant="outline" className="text-bridge-text/70">Completed</Badge>;
    default:
      return null;
  }
};

const StudentAppointments = () => {
  const { appointments, isLoading, updateAppointmentStatus } = useAppointments();
  const { counselors } = useCounselors();
  
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };
  
  const getCounselorName = (counselorId: string) => {
    const counselor = counselors.find(c => c.user_id === counselorId);
    return counselor?.full_name || 'Unknown Counselor';
  };
  
  const handleStatusUpdate = async (appointmentId: string, newStatus: 'cancelled') => {
    await updateAppointmentStatus.mutateAsync({ id: appointmentId, status: newStatus });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p>Loading appointments...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">My Appointments</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          View and manage your counseling sessions
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Appointments</h2>
        <Button asChild className="bridge-button-primary">
          <Link to="/student/counselors">Book New Meeting</Link>
        </Button>
      </div>
      
      <Tabs defaultValue="pending" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({confirmedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingAppointments.length > 0 ? (
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  counselorName={getCounselorName(appointment.counselor_id)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-bridge-text/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending appointments</h3>
              <p className="text-bridge-text/70 mb-6">
                You don't have any pending appointment requests.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {confirmedAppointments.length > 0 ? (
            <div className="space-y-4">
              {confirmedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  counselorName={getCounselorName(appointment.counselor_id)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-bridge-text/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
              <p className="text-bridge-text/70 mb-6">
                You don't have any confirmed appointments scheduled.
              </p>
              <Button asChild className="bridge-button-primary">
                <Link to="/student/counselors">Book a Meeting</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  counselorName={getCounselorName(appointment.counselor_id)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-bridge-text/50 mb-4" />
              <h3 className="text-lg font-medium">No past appointments</h3>
              <p className="text-bridge-text/70">
                Your history of completed appointments will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

// AppointmentCard component
interface AppointmentCardProps {
  appointment: any;
  counselorName: string;
  onStatusUpdate: (id: string, status: 'cancelled') => void;
}

const AppointmentCard = ({ appointment, counselorName, onStatusUpdate }: AppointmentCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <Card className="bridge-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-bridge-primary" />
              <span className="font-medium">{formatDate(appointment.date)}</span>
              <span className="text-bridge-text/70">•</span>
              <Clock className="h-4 w-4 text-bridge-text/70" />
              <span>{appointment.time}</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-bridge-primary">{counselorName}</h3>
              <div className="flex items-center text-sm text-bridge-text/70">
                <User size={16} className="mr-1" />
                Counselor Session
              </div>
            </div>
            
            {appointment.reason && (
              <div className="bg-bridge-muted/20 p-2 rounded-lg text-sm">
                <span className="font-medium">Reason:</span> {appointment.reason}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end mt-4 md:mt-0 space-y-3">
            <div>{getStatusBadge(appointment.status)}</div>
            
            <div className="flex space-x-2">
              {appointment.status === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                >
                  Cancel Request
                </Button>
              )}
              
              {appointment.status === 'confirmed' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                >
                  Cancel
                </Button>
              )}
              
              {appointment.status === 'completed' && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/student/counselors">Book Follow-up</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAppointments;