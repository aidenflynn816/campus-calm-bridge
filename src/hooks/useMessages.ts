
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message, TypingStatus } from '../types/message';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useMessages = (chatWithUserId: string) => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from AuthContext instead of directly from supabase
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = user?.id; // Use user from AuthContext

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatWithUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching messages",
          description: error.message
        });
        return [];
      }

      return data as Message[];
    },
    enabled: !!currentUserId && !!chatWithUserId, // Only run query if we have both IDs
  });

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId) throw new Error("User not authenticated");
      
      const { error } = await supabase.from('messages').insert({
        content,
        sender_id: currentUserId,
        recipient_id: chatWithUserId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatWithUserId] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message
      });
    }
  });

  // Update typing status
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUserId) return;
    
    const { error } = await supabase
      .from('typing_status')
      .upsert({
        user_id: currentUserId,
        chat_with_user_id: chatWithUserId,
        is_typing: isTyping
      }, {
        onConflict: 'user_id,chat_with_user_id'
      });

    if (error) {
      console.error('Error updating typing status:', error);
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!currentUserId || !chatWithUserId) return;
    
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUserId}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', chatWithUserId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatWithUserId, currentUserId, queryClient]);

  // Subscribe to typing status
  useEffect(() => {
    if (!currentUserId || !chatWithUserId) return;
    
    // Create a typed channel
    const channel = supabase.channel('typing_status');
    
    // Subscribe to changes
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `user_id=eq.${chatWithUserId}`
        },
        (payload: { new: TypingStatus }) => {
          setIsTyping(payload.new.is_typing);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatWithUserId, currentUserId]);

  return {
    messages,
    isLoading,
    sendMessage,
    updateTypingStatus,
    isTyping
  };
};
