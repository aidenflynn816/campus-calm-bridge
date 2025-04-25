
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message, TypingStatus } from '../types/message';
import { useToast } from '@/hooks/use-toast';

export const useMessages = (chatWithUserId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = supabase.auth.getSession()?.user?.id;

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatWithUserId],
    queryFn: async () => {
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
    }
  });

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: async (content: string) => {
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
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
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
    const channel = supabase
      .channel('typing')
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
  }, [chatWithUserId]);

  return {
    messages,
    isLoading,
    sendMessage,
    updateTypingStatus,
    isTyping
  };
};
