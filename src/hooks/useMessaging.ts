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
    onSuccess: async () => {
      // Don't invalidate queries - real-time listener handles optimistic updates
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });

      // Fire-and-forget: invoke the email notification edge function
      try {
        await supabase.functions.invoke('send-message-notification', {
          body: { sender_id: currentUserId!, recipient_id: recipientId }
        });
      } catch (err) {
        console.error('Failed to invoke send-message-notification:', err);
      }
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

  // Listen for real-time messages and typing status
  useEffect(() => {
    if (!currentUserId || !recipientId) return;
    
    const messagesChannel = supabase
      .channel(`messages-${currentUserId}-${recipientId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId}))`
      }, (payload) => {
        if (payload.new) {
          const newMessage = payload.new as Message;
          
          // Optimistically update the query cache instead of invalidating
          queryClient.setQueryData(['messages', currentUserId, recipientId], (oldMessages: Message[] = []) => {
            // Avoid duplicates
            if (oldMessages.some(msg => msg.id === newMessage.id)) {
              return oldMessages;
            }
            return [...oldMessages, newMessage].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
          
          // Auto-mark as read if we're the recipient
          if (newMessage.recipient_id === currentUserId && !newMessage.read_at) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id)
              .then(() => {
                // Update the message in cache to show it's read
                queryClient.setQueryData(['messages', currentUserId, recipientId], (oldMessages: Message[] = []) =>
                  oldMessages.map(msg => 
                    msg.id === newMessage.id 
                      ? { ...msg, read_at: new Date().toISOString() }
                      : msg
                  )
                );
              });
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId}))`
      }, (payload) => {
        if (payload.new) {
          const updatedMessage = payload.new as Message;
          
          // Update message in cache (for read status changes)
          queryClient.setQueryData(['messages', currentUserId, recipientId], (oldMessages: Message[] = []) =>
            oldMessages.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      })
      .subscribe();

    const typingChannel = supabase
      .channel(`typing-${currentUserId}-${recipientId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `and(user_id.eq.${recipientId},chat_with_user_id.eq.${currentUserId})`
      }, (payload) => {
        if (payload.new) {
          const typingStatus = payload.new as any;
          setIsTyping(!!typingStatus.is_typing);
          
          // Auto-clear typing status after 3 seconds of no updates
          if (typingStatus.is_typing) {
            setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [recipientId, currentUserId, queryClient]);

  return {
    messages,
    isLoading,
    sendMessage,
    isSending,
    updateTypingStatus,
    isTyping
  };
};