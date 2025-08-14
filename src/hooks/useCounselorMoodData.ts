import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DAILY_ISSUES, MOOD_OPTIONS } from "@/hooks/useMoodCheckins";
import { startOfWeek, endOfWeek, subWeeks, format, startOfDay, endOfDay, subDays } from "date-fns";

export interface AggregatedMoodData {
  id: string;
  user_id: string;
  mood_rating: number;
  mood_emoji: string;
  notes?: string;
  daily_issues?: string[];
  created_at: string;
  student_name?: string;
}

export interface OverviewMetrics {
  averageMoodScore: number;
  studentsReportingIssues: number;
  totalStudents: number;
  mostCommonIssueToday: string;
  mostCommonIssueThisWeek: string;
  changeVsLastWeek: number;
}

export interface MoodTrendData {
  date: string;
  averageMood: number;
  checkinsCount: number;
}

export interface IssueFrequencyData {
  issue: string;
  today: number;
  past7Days: number;
  past30Days: number;
}

export interface CalendarHeatmapData {
  date: string;
  issueCount: number;
  level: number; // 0-4 for heat intensity
}

export interface MoodByIssueData {
  issue: string;
  averageMood: number;
  occurrences: number;
  severity: 'low' | 'medium' | 'high';
}

export const useCounselorMoodData = (dateRange: number = 30) => {
  const { toast } = useToast();

  const { data: moodData = [], isLoading, error } = useQuery({
    queryKey: ['counselor-mood-data', dateRange],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dateRange);

        // Fetch mood check-ins from students who have approved data sharing
        const { data, error } = await supabase
          .from('mood_check_ins')
          .select('*')
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching counselor mood data:', error);
          throw error;
        }

        return (data || []).map(item => ({
          ...item,
          student_name: 'Student' // Placeholder - would need proper student name lookup
        })) as AggregatedMoodData[];
      } catch (error) {
        console.error('Error fetching counselor mood data:', error);
        toast({
          variant: "destructive",
          title: "Error fetching mood data",
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return [];
      }
    },
  });

  // Calculate overview metrics
  const getOverviewMetrics = (): OverviewMetrics => {
    const today = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1));
    const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1));

    const todayData = moodData.filter(item => 
      new Date(item.created_at) >= today && new Date(item.created_at) <= todayEnd
    );
    const thisWeekData = moodData.filter(item => 
      new Date(item.created_at) >= thisWeekStart && new Date(item.created_at) <= thisWeekEnd
    );
    const lastWeekData = moodData.filter(item => 
      new Date(item.created_at) >= lastWeekStart && new Date(item.created_at) <= lastWeekEnd
    );

    const averageMoodScore = moodData.length > 0 
      ? moodData.reduce((sum, item) => sum + item.mood_rating, 0) / moodData.length 
      : 0;

    const uniqueStudents = new Set(moodData.map(item => item.user_id));
    const studentsWithIssues = new Set(
      moodData
        .filter(item => item.daily_issues && item.daily_issues.length > 0)
        .map(item => item.user_id)
    );

    // Most common issue today
    const todayIssues = todayData.flatMap(item => item.daily_issues || []);
    const todayIssueCounts = todayIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonIssueToday = Object.keys(todayIssueCounts).reduce((a, b) => 
      todayIssueCounts[a] > todayIssueCounts[b] ? a : b, ''
    );

    // Most common issue this week
    const thisWeekIssues = thisWeekData.flatMap(item => item.daily_issues || []);
    const thisWeekIssueCounts = thisWeekIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonIssueThisWeek = Object.keys(thisWeekIssueCounts).reduce((a, b) => 
      thisWeekIssueCounts[a] > thisWeekIssueCounts[b] ? a : b, ''
    );

    // Change vs last week
    const thisWeekAvg = thisWeekData.length > 0 
      ? thisWeekData.reduce((sum, item) => sum + item.mood_rating, 0) / thisWeekData.length 
      : 0;
    const lastWeekAvg = lastWeekData.length > 0 
      ? lastWeekData.reduce((sum, item) => sum + item.mood_rating, 0) / lastWeekData.length 
      : 0;
    const changeVsLastWeek = thisWeekAvg - lastWeekAvg;

    return {
      averageMoodScore,
      studentsReportingIssues: studentsWithIssues.size,
      totalStudents: uniqueStudents.size,
      mostCommonIssueToday: DAILY_ISSUES.find(i => i.id === mostCommonIssueToday)?.label || 'None',
      mostCommonIssueThisWeek: DAILY_ISSUES.find(i => i.id === mostCommonIssueThisWeek)?.label || 'None',
      changeVsLastWeek
    };
  };

  // Get mood trend data
  const getMoodTrendData = (days: number = 30): MoodTrendData[] => {
    const result: MoodTrendData[] = [];
    const startDate = subDays(new Date(), days - 1);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'MMM dd');
      
      const dayData = moodData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.toDateString() === date.toDateString();
      });

      const averageMood = dayData.length > 0 
        ? dayData.reduce((sum, item) => sum + item.mood_rating, 0) / dayData.length 
        : 0;

      result.push({
        date: dateStr,
        averageMood: Math.round(averageMood * 100) / 100,
        checkinsCount: dayData.length
      });
    }

    return result;
  };

  // Get issue frequency data
  const getIssueFrequencyData = (): IssueFrequencyData[] => {
    const today = startOfDay(new Date());
    const past7Days = subDays(new Date(), 7);
    const past30Days = subDays(new Date(), 30);

    return DAILY_ISSUES.map(issue => {
      const todayCount = moodData
        .filter(item => new Date(item.created_at) >= today)
        .filter(item => item.daily_issues?.includes(issue.id))
        .length;

      const past7DaysCount = moodData
        .filter(item => new Date(item.created_at) >= past7Days)
        .filter(item => item.daily_issues?.includes(issue.id))
        .length;

      const past30DaysCount = moodData
        .filter(item => new Date(item.created_at) >= past30Days)
        .filter(item => item.daily_issues?.includes(issue.id))
        .length;

      return {
        issue: issue.label,
        today: todayCount,
        past7Days: past7DaysCount,
        past30Days: past30DaysCount
      };
    });
  };

  // Get calendar heatmap data
  const getCalendarHeatmapData = (days: number = 30): CalendarHeatmapData[] => {
    const result: CalendarHeatmapData[] = [];
    const startDate = subDays(new Date(), days - 1);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayData = moodData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.toDateString() === date.toDateString();
      });

      const issueCount = dayData.reduce((sum, item) => 
        sum + (item.daily_issues?.length || 0), 0
      );

      // Calculate heat level (0-4)
      const level = Math.min(Math.floor(issueCount / 2), 4);

      result.push({
        date: dateStr,
        issueCount,
        level
      });
    }

    return result;
  };

  // Get mood by issue analysis
  const getMoodByIssueData = (): MoodByIssueData[] => {
    return DAILY_ISSUES.map(issue => {
      const itemsWithIssue = moodData.filter(item => 
        item.daily_issues?.includes(issue.id)
      );

      const averageMood = itemsWithIssue.length > 0 
        ? itemsWithIssue.reduce((sum, item) => sum + item.mood_rating, 0) / itemsWithIssue.length 
        : 0;

      const severity: 'low' | 'medium' | 'high' = averageMood <= 2 ? 'high' : averageMood <= 3.5 ? 'medium' : 'low';

      return {
        issue: issue.label,
        averageMood: Math.round(averageMood * 100) / 100,
        occurrences: itemsWithIssue.length,
        severity
      };
    }).filter(item => item.occurrences > 0);
  };

  return {
    moodData,
    isLoading,
    error,
    getOverviewMetrics,
    getMoodTrendData,
    getIssueFrequencyData,
    getCalendarHeatmapData,
    getMoodByIssueData
  };
};