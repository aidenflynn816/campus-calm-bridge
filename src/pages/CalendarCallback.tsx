import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";

export default function CalendarCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Failed to connect Google Calendar");
          navigate("/student/appointments");
          return;
        }

        if (data.session) {
          toast.success("Google Calendar connected successfully!");
          navigate("/student/appointments");
        } else {
          toast.error("Failed to connect Google Calendar");
          navigate("/student/appointments");
        }
      } catch (error) {
        console.error("Callback handling error:", error);
        toast.error("Failed to connect Google Calendar");
        navigate("/student/appointments");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <LoadingScreen />;
}