import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Student {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export const useStudents = () => {
  const { toast } = useToast();

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url')
          .eq('role', 'student')
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Error fetching students:', error);
          toast({
            variant: "destructive",
            title: "Error fetching students",
            description: error.message
          });
          return [];
        }

        // Transform the data to match our interface
        return (data || []).map(student => ({
          id: student.id,
          user_id: student.user_id,
          full_name: student.full_name || 'Unknown Student',
          avatar_url: student.avatar_url,
          lastMessage: undefined, // This could be enhanced later with a JOIN
          lastMessageTime: undefined,
          unreadCount: 0,
        })) as Student[];
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          variant: "destructive",
          title: "Error fetching students",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
  });

  return {
    students,
    isLoading,
    error,
  };
};