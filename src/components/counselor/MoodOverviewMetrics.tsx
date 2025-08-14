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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Average Mood Score */}
      <Card className="bridge-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
          <Brain className="h-4 w-4 text-bridge-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-bridge-primary">
            {metrics.averageMoodScore.toFixed(1)}/5
          </div>
          <div className="flex items-center space-x-1 text-xs text-bridge-text/70">
            {getTrendIcon(metrics.changeVsLastWeek)}
            <span className={getTrendColor(metrics.changeVsLastWeek)}>
              {metrics.changeVsLastWeek > 0 ? '+' : ''}{metrics.changeVsLastWeek.toFixed(1)} vs last week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Students Reporting Issues */}
      <Card className="bridge-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students w/ Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-bridge-primary">
            {getIssuePercentage()}%
          </div>
          <p className="text-xs text-bridge-text/70">
            {metrics.studentsReportingIssues} of {metrics.totalStudents} students
          </p>
        </CardContent>
      </Card>

      {/* Most Common Issue Today */}
      <Card className="bridge-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Issue Today</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-bridge-primary mb-1">
            {metrics.mostCommonIssueToday}
          </div>
          <Badge variant="secondary" className="text-xs">
            Today
          </Badge>
        </CardContent>
      </Card>

      {/* Most Common Issue This Week */}
      <Card className="bridge-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Issue This Week</CardTitle>
          <Users className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-bridge-primary mb-1">
            {metrics.mostCommonIssueThisWeek}
          </div>
          <Badge variant="outline" className="text-xs">
            Past 7 days
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodOverviewMetrics;