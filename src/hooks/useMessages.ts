import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message, TypingStatus } from '../types/message';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useMessages = (chatWithUserId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = user?.id;

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
    enabled: !!currentUserId && !!chatWithUserId,
  });

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

  useEffect(() => {
    if (!currentUserId || !chatWithUserId) return;
    
    const channel = supabase
      .channel('realtime-messages')
      .on('presence', { event: 'message' }, (payload) => {
        if (payload.recipient_id === currentUserId) {
          queryClient.invalidateQueries({ queryKey: ['messages', chatWithUserId] });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to message updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatWithUserId, currentUserId, queryClient]);

  useEffect(() => {
    if (!currentUserId || !chatWithUserId) return;
    
    const channel = supabase
      .channel('realtime-typing')
      .on('presence', { event: 'typing' }, (payload: { user_id: string; is_typing: boolean }) => {
        if (payload.user_id === chatWithUserId) {
          setIsTyping(payload.is_typing);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to typing status updates');
        }
      });

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
