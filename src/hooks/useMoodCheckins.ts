import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Frown, Meh, Smile, SmilePlus, FrownIcon as FrownSad } from "lucide-react";

export interface MoodCheckin {
  id: string;
  user_id: string;
  mood_rating: number;
  mood_emoji: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMoodCheckinData {
  mood_rating: number;
  mood_emoji: string;
  notes?: string;
}

export const MOOD_OPTIONS = [
  { 
    rating: 1, 
    emoji: "very-sad", 
    label: "Very Sad", 
    color: "text-red-500",
    bgColor: "bg-red-500",
    icon: Frown,
    description: "Feeling really down"
  },
  { 
    rating: 2, 
    emoji: "sad", 
    label: "Sad", 
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    icon: FrownSad,
    description: "Feeling low"
  },
  { 
    rating: 3, 
    emoji: "neutral", 
    label: "Neutral", 
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    icon: Meh,
    description: "Feeling okay"
  },
  { 
    rating: 4, 
    emoji: "happy", 
    label: "Happy", 
    color: "text-green-500",
    bgColor: "bg-green-500",
    icon: Smile,
    description: "Feeling good"
  },
  { 
    rating: 5, 
    emoji: "very-happy", 
    label: "Very Happy", 
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    icon: SmilePlus,
    description: "Feeling amazing"
  },
];

export const useMoodCheckins = (targetUserId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: moodCheckins = [], isLoading, error } = useQuery({
    queryKey: ['mood-checkins', targetUserId],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        // Use targetUserId if provided, otherwise use current user's ID
        const userId = targetUserId || user.user.id;

        const { data, error } = await supabase
          .from('mood_check_ins')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching mood check-ins:', error);
          throw error;
        }

        return (data || []) as MoodCheckin[];
      } catch (error) {
        console.error('Error fetching mood check-ins:', error);
        toast({
          variant: "destructive",
          title: "Error fetching mood check-ins",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
  });

  const createMoodCheckin = useMutation({
    mutationFn: async (data: CreateMoodCheckinData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: checkin, error } = await supabase
        .from('mood_check_ins')
        .insert([
          {
            user_id: user.user.id,
            mood_rating: data.mood_rating,
            mood_emoji: data.mood_emoji,
            notes: data.notes,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return checkin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-checkins'] });
      toast({
        title: "Mood check-in recorded!",
        description: "Your mood has been successfully logged."
      });
    },
    onError: (error) => {
      console.error('Error creating mood check-in:', error);
      toast({
        variant: "destructive",
        title: "Error recording mood",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    },
  });

  const updateMoodCheckin = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateMoodCheckinData> }) => {
      const { data: checkin, error } = await supabase
        .from('mood_check_ins')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return checkin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-checkins'] });
      toast({
        title: "Mood check-in updated!",
        description: "Your mood has been successfully updated."
      });
    },
    onError: (error) => {
      console.error('Error updating mood check-in:', error);
      toast({
        variant: "destructive",
        title: "Error updating mood",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    },
  });

  const deleteMoodCheckin = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mood_check_ins')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-checkins'] });
      toast({
        title: "Mood check-in deleted",
        description: "Your mood check-in has been deleted."
      });
    },
    onError: (error) => {
      console.error('Error deleting mood check-in:', error);
      toast({
        variant: "destructive",
        title: "Error deleting mood check-in",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    },
  });

  // Get today's mood check-in
  const todayCheckin = moodCheckins.find(checkin => {
    const today = new Date().toDateString();
    const checkinDate = new Date(checkin.created_at).toDateString();
    return today === checkinDate;
  });

  // Get mood trend data for charts
  const getMoodTrendData = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return moodCheckins
      .filter(checkin => new Date(checkin.created_at) >= cutoffDate)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(checkin => ({
        date: new Date(checkin.created_at).toLocaleDateString(),
        mood: checkin.mood_rating,
        emoji: checkin.mood_emoji,
        notes: checkin.notes,
      }));
  };

  return {
    moodCheckins,
    isLoading,
    error,
    createMoodCheckin,
    updateMoodCheckin,
    deleteMoodCheckin,
    todayCheckin,
    getMoodTrendData,
  };
};