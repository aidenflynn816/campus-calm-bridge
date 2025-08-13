import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Counselor {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export const useCounselors = () => {
  const { toast } = useToast();

  const { data: counselors = [], isLoading, error } = useQuery({
    queryKey: ['counselors'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url')
          .eq('role', 'counselor')
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Error fetching counselors:', error);
          toast({
            variant: "destructive",
            title: "Error fetching counselors",
            description: error.message
          });
          return [];
        }

        // Transform the data to match our interface
        return (data || []).map(counselor => ({
          id: counselor.id,
          user_id: counselor.user_id,
          full_name: counselor.full_name || 'Unknown Counselor',
          avatar_url: counselor.avatar_url,
          lastMessage: undefined, // This could be enhanced later with a JOIN
          lastMessageTime: undefined,
          unreadCount: 0,
        })) as Counselor[];
      } catch (error) {
        console.error('Error fetching counselors:', error);
        toast({
          variant: "destructive",
          title: "Error fetching counselors",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
  });

  return {
    counselors,
    isLoading,
    error,
  };
};