
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/Dashboard";
import CounselorDashboard from "./pages/counselor/Dashboard";
import StudentCounselors from "./pages/student/Counselors";
import Messages from "./pages/student/Messages";
import StudentAppointments from "./pages/student/Appointments";
import Resources from "./pages/student/Resources";
import CounselorAppointments from "./pages/counselor/Appointments";
import CounselorMessages from "./pages/counselor/Messages";
import CounselorResources from "./pages/counselor/Resources";
import StudentList from "./pages/counselor/Students";
import StudentDetail from "./pages/counselor/StudentDetail";
import MoodTracking from "./pages/student/MoodTracking";
import MoodInsights from "./pages/counselor/MoodInsights";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import BookMeeting from "./pages/student/BookMeeting";
import StudentProfile from "./pages/student/Profile";
import CounselorProfile from "./pages/counselor/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/counselors" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentCounselors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/messages" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/appointments" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/resources" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Resources />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/mood" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <MoodTracking />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/book" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <BookMeeting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/profile" 
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Counselor routes */}
          <Route 
            path="/counselor" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <CounselorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/counselor/appointments" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <CounselorAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/counselor/messages" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <CounselorMessages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/counselor/resources" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <CounselorResources />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/counselor/students" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <StudentList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/counselor/students/:studentId" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <StudentDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/counselor/mood-insights" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <MoodInsights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/counselor/profile" 
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <CounselorProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Home page with auth redirect */}
          <Route 
            path="/" 
            element={<Index />} 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
