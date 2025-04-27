
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message, TypingStatus } from '../types/message';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMessages = (chatWithUserId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = user?.id;

  // Fetch messages between current user and selected chat user
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatWithUserId],
    queryFn: async () => {
      if (!currentUserId || !chatWithUserId) return [];
      
      try {
        // In demo mode with mock IDs, return mock messages
        if (chatWithUserId.startsWith('student-') || 
            /^[1-9]\d*$/.test(chatWithUserId)) {
          // Generate mock messages for demo purposes
          const mockMessages: Message[] = [
            {
              id: '1234-5678-abcd-efgh',
              content: 'Hi there! How can I help you today?',
              sender_id: chatWithUserId,
              recipient_id: currentUserId,
              created_at: new Date(Date.now() - 3600000).toISOString(),
              read_at: new Date(Date.now() - 3300000).toISOString()
            },
            {
              id: 'abcd-efgh-1234-5678',
              content: 'I wanted to discuss my progress this semester.',
              sender_id: currentUserId,
              recipient_id: chatWithUserId,
              created_at: new Date(Date.now() - 3000000).toISOString(),
              read_at: new Date(Date.now() - 2800000).toISOString()
            },
            {
              id: '5678-abcd-efgh-1234',
              content: 'That sounds great. What specific areas would you like to focus on?',
              sender_id: chatWithUserId,
              recipient_id: currentUserId, 
              created_at: new Date(Date.now() - 2400000).toISOString(),
              read_at: new Date(Date.now() - 2200000).toISOString()
            }
          ];
          return mockMessages;
        }
        
        // For real Supabase data (with valid UUIDs)
        // Get messages where current user is either sender or recipient
        // and the other party is chatWithUserId
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${chatWithUserId}),and(sender_id.eq.${chatWithUserId},recipient_id.eq.${currentUserId})`)
          .order('created_at', { ascending: true });

        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching messages",
            description: error.message
          });
          return [];
        }

        // Mark messages from other user as read
        const unreadMessages = data?.filter(msg => 
          msg.sender_id === chatWithUserId && !msg.read_at
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
    enabled: !!currentUserId && !!chatWithUserId,
  });

  // Send new message
  const { mutate: sendMessage } = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId || !chatWithUserId) throw new Error("User not authenticated or no recipient selected");
      
      try {
        // For demo mode with mock IDs
        if (chatWithUserId.startsWith('student-') || 
            /^[1-9]\d*$/.test(chatWithUserId)) {
          // Return a mock successful response for demo purposes
          return { success: true };
        }
        
        // Real Supabase implementation
        const newMessage = {
          content,
          sender_id: currentUserId,
          recipient_id: chatWithUserId
        };

        const { error } = await supabase
          .from('messages')
          .insert(newMessage);

        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
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
    if (!currentUserId || !chatWithUserId) return;
    
    // Skip for demo mode
    if (chatWithUserId.startsWith('student-') || /^[1-9]\d*$/.test(chatWithUserId)) {
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (!currentUserId || !chatWithUserId) return;
    
    // Skip realtime subscription for demo mode
    if (chatWithUserId.startsWith('student-') || /^[1-9]\d*$/.test(chatWithUserId)) {
      return;
    }
    
    // Subscribe to message inserts/updates
    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${currentUserId}`
      }, (payload) => {
        // If the new message is from the selected chat, invalidate the query
        if (payload.new && payload.new.sender_id === chatWithUserId) {
          queryClient.invalidateQueries({ queryKey: ['messages', chatWithUserId] });
          
          // Mark message as read immediately if we're in this chat
          supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', payload.new.id);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to message updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to message updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatWithUserId, currentUserId, queryClient]);

  // Listen for typing status changes
  useEffect(() => {
    if (!currentUserId || !chatWithUserId) return;
    
    // Skip for demo mode
    if (chatWithUserId.startsWith('student-') || /^[1-9]\d*$/.test(chatWithUserId)) {
      return;
    }
    
    // Set up subscription for typing status
    const channel = supabase
      .channel('realtime-typing')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'typing_status',
        filter: `user_id=eq.${chatWithUserId}`
      }, (payload) => {
        if (payload.new && payload.new.chat_with_user_id === currentUserId) {
          setIsTyping(!!payload.new.is_typing);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to typing status updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to typing status updates');
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
