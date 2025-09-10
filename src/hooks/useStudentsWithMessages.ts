import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface StudentWithMessages {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  hasUnreadMessages: boolean;
}

export const useStudentsWithMessages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentUserId = user?.id;

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students-with-messages', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url')
          .eq('role', 'student')
          .order('full_name', { ascending: true });

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          toast({
            variant: "destructive",
            title: "Error fetching students",
            description: studentsError.message
          });
          return [];
        }

        // For each student, get their message data
        const studentsWithMessages = await Promise.all(
          (studentsData || []).map(async (student) => {
            // Get unread messages count from this student to current user
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', student.user_id)
              .eq('recipient_id', currentUserId)
              .is('read_at', null);

            // Get last message between current user and this student
            const { data: lastMessageData } = await supabase
              .from('messages')
              .select('content, created_at')
              .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${student.user_id}),and(sender_id.eq.${student.user_id},recipient_id.eq.${currentUserId})`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              id: student.id,
              user_id: student.user_id,
              full_name: student.full_name || 'Unknown Student',
              avatar_url: student.avatar_url,
              lastMessage: lastMessageData?.content,
              lastMessageTime: lastMessageData?.created_at,
              unreadCount: unreadCount || 0,
              hasUnreadMessages: (unreadCount || 0) > 0,
            } as StudentWithMessages;
          })
        );

        // Sort students: those with unread messages first, then by last message time, then by name
        return studentsWithMessages.sort((a, b) => {
          // First priority: unread messages
          if (a.hasUnreadMessages && !b.hasUnreadMessages) return -1;
          if (!a.hasUnreadMessages && b.hasUnreadMessages) return 1;
          
          // Second priority: last message time (most recent first)
          if (a.lastMessageTime && b.lastMessageTime) {
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
          }
          if (a.lastMessageTime && !b.lastMessageTime) return -1;
          if (!a.lastMessageTime && b.lastMessageTime) return 1;
          
          // Third priority: alphabetical by name
          return a.full_name.localeCompare(b.full_name);
        });

      } catch (error) {
        console.error('Error fetching students with messages:', error);
        toast({
          variant: "destructive",
          title: "Error fetching students",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
    enabled: !!currentUserId,
  });

  // Listen for new messages to refresh student list
  useEffect(() => {
    if (!currentUserId) return;
    
    console.log('🚀 Setting up realtime for student messages list:', { currentUserId });
    
    const channel = supabase
      .channel(`student-messages-${currentUserId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${currentUserId}`
      }, (payload) => {
        console.log('📨 Message change detected, refreshing student list:', payload);
        queryClient.invalidateQueries({ queryKey: ['students-with-messages', currentUserId] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId}`
      }, (payload) => {
        console.log('📤 Sent message change detected, refreshing student list:', payload);
        queryClient.invalidateQueries({ queryKey: ['students-with-messages', currentUserId] });
      })
      .subscribe((status) => {
        console.log('💡 Student messages realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up student messages realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  return {
    students,
    isLoading,
    error,
  };
};