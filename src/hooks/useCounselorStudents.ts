import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useCounselorStudents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch manually assigned students
  const { data: manuallyAssignedStudents = [], isLoading } = useQuery({
    queryKey: ['counselor-students', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('counselor_students')
        .select('student_id')
        .eq('counselor_id', user.id);

      if (error) {
        console.error('Error fetching manually assigned students:', error);
        return [];
      }

      return data?.map(item => item.student_id) || [];
    },
    enabled: !!user?.id,
  });

  // Check if a student is manually assigned
  const isManuallyAssigned = (studentId: string) => {
    return manuallyAssignedStudents.includes(studentId);
  };

  // Add student to "My Students"
  const addStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('counselor_students')
        .insert({
          counselor_id: user.id,
          student_id: studentId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor-students'] });
      toast({
        title: "Student added",
        description: "Student has been added to your My Students list.",
      });
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove student from "My Students"
  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('counselor_students')
        .delete()
        .eq('counselor_id', user.id)
        .eq('student_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor-students'] });
      toast({
        title: "Student removed",
        description: "Student has been removed from your My Students list.",
      });
    },
    onError: (error) => {
      console.error('Error removing student:', error);
      toast({
        title: "Error",
        description: "Failed to remove student. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    manuallyAssignedStudents,
    isManuallyAssigned,
    addStudent: addStudentMutation.mutate,
    removeStudent: removeStudentMutation.mutate,
    isAddingStudent: addStudentMutation.isPending,
    isRemovingStudent: removeStudentMutation.isPending,
    isLoading,
  };
};