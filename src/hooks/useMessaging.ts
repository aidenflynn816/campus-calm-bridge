import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read_at: string | null;
}

export const useMessaging = (recipientId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = user?.id;

  // Fetch messages between current user and recipient
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', currentUserId, recipientId],
    queryFn: async () => {
      if (!currentUserId || !recipientId) return [];
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          toast({
            variant: "destructive",
            title: "Error fetching messages",
            description: error.message
          });
          return [];
        }

        // Mark messages from recipient as read
        const unreadMessages = data?.filter(msg => 
          msg.sender_id === recipientId && !msg.read_at
        );

        if (unreadMessages && unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadMessages.map(msg => msg.id));
        }

        return data as Message[];
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          variant: "destructive",
          title: "Error fetching messages",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
    enabled: !!currentUserId && !!recipientId,
  });

  // Send new message
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId || !recipientId) throw new Error("User not authenticated or no recipient selected");
      
      const newMessage = {
        content,
        sender_id: currentUserId,
        recipient_id: recipientId
      };

      const { error } = await supabase
        .from('messages')
        .insert(newMessage);

      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', currentUserId, recipientId] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });
    },
    onError: (error: Error) => {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message
      });
    }
  });

  // Update typing status (simplified version)
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUserId || !recipientId) return;
    
    try {
      const { error } = await supabase
        .from('typing_status')
        .upsert({
          user_id: currentUserId,
          chat_with_user_id: recipientId,
          is_typing: isTyping
        }, {
          onConflict: 'user_id,chat_with_user_id'
        });

      if (error) {
        console.error('Error updating typing status:', error);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  // Listen for new messages (real-time)
  useEffect(() => {
    if (!currentUserId || !recipientId) return;
    
    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${currentUserId}`
      }, (payload) => {
        if (payload.new && payload.new.sender_id === recipientId) {
          queryClient.invalidateQueries({ queryKey: ['messages', currentUserId, recipientId] });
          
          // Mark message as read immediately if we're in this chat
          supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', payload.new.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, currentUserId, queryClient]);

  // Listen for typing status changes
  useEffect(() => {
    if (!currentUserId || !recipientId) return;
    
    const channel = supabase
      .channel('realtime-typing')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'typing_status',
        filter: `user_id=eq.${recipientId}`
      }, (payload) => {
        if (payload.new && payload.new.chat_with_user_id === currentUserId) {
          setIsTyping(!!payload.new.is_typing);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, currentUserId]);

  return {
    messages,
    isLoading,
    sendMessage,
    isSending,
    updateTypingStatus,
    isTyping
  };
};