import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DataSharingRequest {
  id: string;
  counselor_id: string;
  student_id: string;
  request_type: string;
  status: 'pending' | 'approved' | 'denied';
  message?: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  counselor?: {
    full_name: string;
    avatar_url?: string;
  };
  student?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useDataSharingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DataSharingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('data_sharing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as DataSharingRequest[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = async (studentId: string, message?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('data_sharing_requests')
        .insert({
          counselor_id: user.id,
          student_id: studentId,
          request_type: 'mood_data',
          message,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchRequests();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const respondToRequest = async (requestId: string, status: 'approved' | 'denied') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('data_sharing_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
      await fetchRequests();
    } catch (err) {
      throw err;
    }
  };

  const getRequestByStudentId = (studentId: string) => {
    return requests.find(
      req => req.student_id === studentId && req.counselor_id === user?.id
    );
  };

  const getPendingRequestsForStudent = () => {
    return requests.filter(
      req => req.student_id === user?.id && req.status === 'pending'
    );
  };

  useEffect(() => {
    fetchRequests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('data_sharing_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_sharing_requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    requests,
    isLoading,
    error,
    createRequest,
    respondToRequest,
    getRequestByStudentId,
    getPendingRequestsForStudent,
    refetch: fetchRequests,
  };
};