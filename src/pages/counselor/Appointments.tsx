
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/useAppointments";

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

const CounselorAppointments = () => {
  const { appointments, isLoading, updateAppointmentStatus } = useAppointments();
  
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
  
  const handleStatusUpdate = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
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
        <h1 className="text-3xl font-bold text-bridge-primary">Appointments</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Manage your student appointments
        </p>
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
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {confirmedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="past">
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

// AppointmentCard component
interface AppointmentCardProps {
  appointment: any;
  onStatusUpdate: (id: string, status: 'confirmed' | 'cancelled' | 'completed') => void;
}

const AppointmentCard = ({ appointment, onStatusUpdate }: AppointmentCardProps) => {
  return (
    <Card className="bridge-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-bridge-primary" />
              <span className="font-medium">{appointment.date}</span>
              <span className="text-bridge-text/70">•</span>
              <Clock className="h-4 w-4 text-bridge-text/70" />
              <span>{appointment.time}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm text-bridge-text/70">
                <Users size={16} className="mr-1" />
                Student ID: {appointment.student_id}
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
            
            {appointment.status === 'pending' && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                >
                  Decline
                </Button>
              </div>
            )}
            
            {appointment.status === 'confirmed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusUpdate(appointment.id, 'completed')}
              >
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CounselorAppointments;
