
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Users, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

interface Appointment {
  id: number;
  date: string;
  time: string;
  counselor: string;
  status: "upcoming" | "completed" | "cancelled" | "pending";
  location: "in-person" | "video";
  notes?: string;
}

const StudentAppointments = () => {
  // Mock data for appointments
  const appointments: Appointment[] = [
    {
      id: 1,
      date: "2025-04-28",
      time: "3:00 PM",
      counselor: "Dr. Jamie Counselor",
      status: "upcoming",
      location: "in-person",
      notes: "Discuss exam stress management strategies",
    },
    {
      id: 2,
      date: "2025-05-05",
      time: "2:30 PM",
      counselor: "Dr. Jordan Smith",
      status: "upcoming",
      location: "video",
    },
    {
      id: 3,
      date: "2025-04-20",
      time: "1:00 PM",
      counselor: "Dr. Jamie Counselor",
      status: "completed",
      location: "in-person",
      notes: "Discussed adjustment to boarding school life",
    },
    {
      id: 4,
      date: "2025-04-12",
      time: "11:00 AM",
      counselor: "Dr. Jordan Smith",
      status: "completed",
      location: "video",
      notes: "Follow-up on sleep hygiene techniques",
    },
    {
      id: 5,
      date: "2025-04-22",
      time: "4:00 PM",
      counselor: "Dr. Jordan Smith",
      status: "cancelled",
      location: "in-person",
    },
    {
      id: 6,
      date: "2025-05-10",
      time: "10:30 AM",
      counselor: "Dr. Jamie Counselor",
      status: "pending",
      location: "in-person",
      notes: "Initial consultation",
    },
  ];
  
  // Filter appointments by status
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "upcoming" || apt.status === "pending"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled"
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-bridge-text/70">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bridge-primary">My Appointments</h1>
        <p className="text-lg text-bridge-text/70 mt-1">
          Manage your counseling sessions
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Appointments</h2>
        <Button asChild className="bridge-button-primary">
          <Link to="/student/book">Book New Meeting</Link>
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="mb-6 bg-bridge-muted/30">
          <TabsTrigger value="upcoming">
            Upcoming & Pending ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Appointments ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-bridge-text/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
              <p className="text-bridge-text/70 mb-6">
                You don't have any scheduled appointments.
              </p>
              <Button asChild className="bridge-button-primary">
                <Link to="/student/book">Book a Meeting</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
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

// Appointment Card component
const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-bridge-text/70">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return null;
    }
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
              <h3 className="font-semibold">{appointment.counselor}</h3>
              <div className="flex items-center text-sm text-bridge-text/70">
                {appointment.location === "in-person" ? (
                  <>
                    <Users size={16} className="mr-1" /> In-person meeting
                  </>
                ) : (
                  <>
                    <Video size={16} className="mr-1" /> Video call
                  </>
                )}
              </div>
            </div>
            
            {appointment.notes && (
              <div className="bg-bridge-muted/20 p-2 rounded-lg text-sm">
                <span className="font-medium">Notes:</span> {appointment.notes}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end mt-4 md:mt-0 space-y-3">
            <div>
              {getStatusBadge(appointment.status)}
            </div>
            
            <div className="flex space-x-2">
              {appointment.status === "upcoming" && (
                <>
                  <Button variant="outline" size="sm">Reschedule</Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50">
                    Cancel
                  </Button>
                </>
              )}
              {appointment.status === "completed" && (
                <Button variant="outline" size="sm">Book Follow-up</Button>
              )}
              {appointment.status === "pending" && (
                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50">
                  Cancel Request
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
