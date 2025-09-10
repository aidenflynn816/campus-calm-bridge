import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useStudentCounselors = () => {
  const { user } = useAuth();

  // Fetch counselors who have manually assigned this student
  const { data: myCounselorIds = [], isLoading } = useQuery({
    queryKey: ['student-counselors', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('counselor_students')
        .select('counselor_id')
        .eq('student_id', user.id);

      if (error) {
        console.error('Error fetching student counselors:', error);
        return [];
      }

      return data?.map(item => item.counselor_id) || [];
    },
    enabled: !!user?.id,
  });

  // Check if a counselor has assigned this student
  const isMyCounselor = (counselorId: string) => {
    return myCounselorIds.includes(counselorId);
  };

  return {
    myCounselorIds,
    isMyCounselor,
    isLoading,
  };
};