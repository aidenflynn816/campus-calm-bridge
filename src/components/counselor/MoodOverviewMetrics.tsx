import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, AlertTriangle, Brain, Calendar } from "lucide-react";
import { OverviewMetrics } from "@/hooks/useCounselorMoodData";

interface MoodOverviewMetricsProps {
  metrics: OverviewMetrics;
}

const MoodOverviewMetrics = ({ metrics }: MoodOverviewMetricsProps) => {
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getIssuePercentage = () => {
    if (metrics.totalStudents === 0) return 0;
    return Math.round((metrics.studentsReportingIssues / metrics.totalStudents) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Mood Score */}
      <Card className="bridge-card group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Average Mood</CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Brain className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-primary">
            {metrics.averageMoodScore.toFixed(1)}<span className="text-xl text-muted-foreground">/5</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            {getTrendIcon(metrics.changeVsLastWeek)}
            <span className={`font-medium ${getTrendColor(metrics.changeVsLastWeek)}`}>
              {metrics.changeVsLastWeek > 0 ? '+' : ''}{metrics.changeVsLastWeek.toFixed(1)} vs last week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Students Reporting Issues */}
      <Card className="bridge-card group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Students w/ Issues</CardTitle>
          <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-orange-600">
            {getIssuePercentage()}<span className="text-xl">%</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {metrics.studentsReportingIssues} of {metrics.totalStudents} students
          </p>
        </CardContent>
      </Card>

      {/* Most Common Issue Today */}
      <Card className="bridge-card group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Top Issue Today</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-base font-bold text-foreground line-clamp-2 min-h-[3rem] flex items-center">
            {metrics.mostCommonIssueToday}
          </div>
          <Badge variant="secondary" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
            Today
          </Badge>
        </CardContent>
      </Card>

      {/* Most Common Issue This Week */}
      <Card className="bridge-card group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Top Issue This Week</CardTitle>
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-base font-bold text-foreground line-clamp-2 min-h-[3rem] flex items-center">
            {metrics.mostCommonIssueThisWeek}
          </div>
          <Badge variant="outline" className="text-xs font-medium border-purple-200 text-purple-700">
            Past 7 days
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodOverviewMetrics;