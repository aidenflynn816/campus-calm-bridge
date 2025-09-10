import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StudentMoodData {
  user_id: string;
  mood_checkins: Array<{
    id: string;
    user_id: string;
    mood_rating: number;
    mood_emoji: string;
    created_at: string;
    updated_at: string;
    notes?: string;
    daily_issues?: string[];
  }>;
}

export const useStudentsMoodData = () => {
  const { toast } = useToast();

  const { data: studentsMoodData = [], isLoading, error } = useQuery({
    queryKey: ['students-mood-data'],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        // First, get all students that this counselor has access to
        const { data: assignedStudents } = await supabase
          .from('counselor_students')
          .select('student_id')
          .eq('counselor_id', user.user.id);

        const { data: approvedRequests } = await supabase
          .from('data_sharing_requests')
          .select('student_id')
          .eq('counselor_id', user.user.id)
          .eq('status', 'approved')
          .eq('request_type', 'mood_data');

        // Combine both lists and remove duplicates
        const assignedStudentIds = assignedStudents?.map(s => s.student_id) || [];
        const approvedStudentIds = approvedRequests?.map(r => r.student_id) || [];
        const allAccessibleStudentIds = [...new Set([...assignedStudentIds, ...approvedStudentIds])];

        if (allAccessibleStudentIds.length === 0) {
          return [];
        }

        // Fetch mood data for all accessible students
        const { data: moodData, error } = await supabase
          .from('mood_check_ins')
          .select('*')
          .in('user_id', allAccessibleStudentIds)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching students mood data:', error);
          throw error;
        }

        // Group mood data by student
        const groupedData: StudentMoodData[] = allAccessibleStudentIds.map(studentId => ({
          user_id: studentId,
          mood_checkins: moodData?.filter(checkin => checkin.user_id === studentId) || []
        }));

        return groupedData;
      } catch (error) {
        console.error('Error fetching students mood data:', error);
        toast({
          variant: "destructive",
          title: "Error fetching mood data",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
  });

  return {
    studentsMoodData,
    isLoading,
    error,
  };
};