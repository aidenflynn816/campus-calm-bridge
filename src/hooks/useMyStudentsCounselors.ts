import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useMyStudentsCounselors = () => {
  const { user } = useAuth();

  const { data: recentMessages = [], isLoading } = useQuery({
    queryKey: ['recent-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get messages from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, created_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .gte('created_at', threeMonthsAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent messages:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get unique user IDs that the current user has messaged with in the last 3 months
  const getRecentlyMessagedUsers = () => {
    if (!user?.id) return [];
    
    const userIds = new Set<string>();
    
    recentMessages.forEach(message => {
      if (message.sender_id === user.id) {
        userIds.add(message.recipient_id);
      } else if (message.recipient_id === user.id) {
        userIds.add(message.sender_id);
      }
    });
    
    return Array.from(userIds);
  };

  // Check if current user has messaged a specific user in the last 3 months
  const hasRecentlyMessaged = (userId: string) => {
    return getRecentlyMessagedUsers().includes(userId);
  };

  return {
    recentlyMessagedUsers: getRecentlyMessagedUsers(),
    hasRecentlyMessaged,
    isLoading,
  };
};