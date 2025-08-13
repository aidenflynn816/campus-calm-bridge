
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Appointment = {
  id: string;
  student_id: string;
  counselor_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  created_at: string;
  updated_at: string;
};

export const useAppointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        toast.error("Error fetching appointments");
        throw error;
      }

      return data as Appointment[];
    },
    enabled: !!user,
  });

  const createAppointment = useMutation({
    mutationFn: async (newAppointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'status' | 'student_id'>) => {
      console.log("Creating appointment with data:", {
        ...newAppointment,
        student_id: user?.id,
        status: 'pending'
      });

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...newAppointment,
          student_id: user?.id,
          status: 'pending'
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        if (error.message.includes('already booked')) {
          toast.error("This time slot is already booked");
        } else {
          toast.error(`Error creating appointment: ${error.message}`);
        }
        throw error;
      }

      if (!data) {
        console.error("No data returned from appointment creation");
        throw new Error("Failed to create appointment - no data returned");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Appointment request sent successfully");
    },
  });

  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment['status'] }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error("Error updating appointment");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Appointment updated successfully");
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointmentStatus,
  };
};
