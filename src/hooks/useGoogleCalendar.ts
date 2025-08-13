import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AvailabilityResponse {
  availableSlots: string[];
  calendarConnected: boolean;
}

export const useGoogleCalendar = () => {
  const connectGoogleCalendar = useMutation({
    mutationFn: async () => {
      // This would typically redirect to Google OAuth
      // For now, we'll simulate the connection
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.events',
          redirectTo: `${window.location.origin}/calendar-callback`
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Google Calendar connected successfully");
    },
    onError: (error) => {
      toast.error(`Failed to connect Google Calendar: ${error.message}`);
    },
  });

  const syncCalendarEvent = useMutation({
    mutationFn: async ({ action, appointmentId, eventData }: {
      action: 'create' | 'update' | 'delete';
      appointmentId: string;
      eventData?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action,
          appointmentId,
          eventData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const actionText = variables.action === 'create' ? 'created' : 
                        variables.action === 'update' ? 'updated' : 'deleted';
      toast.success(`Calendar event ${actionText} successfully`);
    },
    onError: (error) => {
      toast.error(`Calendar sync failed: ${error.message}`);
    },
  });

  return {
    connectGoogleCalendar,
    syncCalendarEvent,
  };
};

export const useAvailability = (counselorId: string, date: string) => {
  return useQuery({
    queryKey: ['availability', counselorId, date],
    queryFn: async (): Promise<AvailabilityResponse> => {
      const { data, error } = await supabase.functions.invoke('get-availability', {
        body: {
          counselorId,
          date
        }
      });

      if (error) {
        console.error('Availability fetch error:', error);
        throw error;
      }

      return data;
    },
    enabled: !!counselorId && !!date,
  });
};