import { useAuth } from "@/contexts/AuthContext";
import { useCounselorStudents } from "./useCounselorStudents";

export const useMyStudentsCounselors = () => {
  const { user } = useAuth();
  const { manuallyAssignedStudents } = useCounselorStudents();

  // Check if user is "My Student" (manually assigned only)
  const isMyStudent = (userId: string) => {
    return manuallyAssignedStudents.includes(userId);
  };

  // For students, check if they are assigned to any counselor
  // This would need a separate query, but for now we'll use the existing logic
  const hasRecentlyMessaged = (userId: string) => {
    // This is kept for backward compatibility but will be replaced with manual assignment check
    return false;
  };

  return {
    isMyStudent,
    hasRecentlyMessaged, // Deprecated, kept for compatibility
    isLoading: false,
  };
};