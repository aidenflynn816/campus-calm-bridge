import { useState } from "react";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCounselorMoodData } from "@/hooks/useCounselorMoodData";
import { useCounselorStudents } from "@/hooks/useCounselorStudents";
import MoodOverviewMetrics from "@/components/counselor/MoodOverviewMetrics";
import MoodTrendChart from "@/components/counselor/MoodTrendChart";
import IssuesFrequencyChart from "@/components/counselor/IssuesFrequencyChart";
import CalendarHeatmap from "@/components/counselor/CalendarHeatmap";
import MoodByIssueTable from "@/components/counselor/MoodByIssueTable";
import { BarChart3, TrendingUp, Calendar, Table, AlertCircle } from "lucide-react";
const MoodInsights = () => {
  const [dateRange, setDateRange] = useState(30);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const { manuallyAssignedStudents } = useCounselorStudents();
  const {
    moodData,
    isLoading,
    getOverviewMetrics,
    getMoodTrendData,
    getIssueFrequencyData,
    getCalendarHeatmapData,
    getMoodByIssueData
  } = useCounselorMoodData(dateRange, selectedGroup, manuallyAssignedStudents);
  const overviewMetrics = getOverviewMetrics();
  const trendData = getMoodTrendData(dateRange);
  const issuesFrequencyData = getIssueFrequencyData();
  const calendarHeatmapData = getCalendarHeatmapData(30);
  const moodByIssueData = getMoodByIssueData();
  const handleDrillDown = (issue: string, period: string) => {
    console.log(`Drilling down into ${issue} for ${period}`);
    // TODO: Implement drill-down functionality
    // This could open a modal or navigate to a detailed view
  };
  if (isLoading) {
    return <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bridge-primary mx-auto mb-4"></div>
            <p className="text-bridge-text/70">Loading mood insights...</p>
          </div>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-4 border-b border-border">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-bridge-primary tracking-tight">Mood Data Insights</h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Comprehensive analytics of student mood check-ins and issues
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-44 bg-background shadow-sm">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="my-students">My Students</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange.toString()} onValueChange={value => setDateRange(parseInt(value))}>
              <SelectTrigger className="w-36 bg-background shadow-sm">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Access Notice */}
        {moodData.length === 0 && <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 mb-1">No mood data available</p>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    Students need to approve data sharing requests for their mood check-ins to appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>}

        {moodData.length > 0 && <>
            {/* Overview Metrics */}
            <MoodOverviewMetrics metrics={overviewMetrics} />

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="trends" className="space-y-6">
              <TabsList className="bg-muted/50 p-1 h-auto rounded-xl shadow-sm">
                <TabsTrigger value="trends" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="issues" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Issues</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                  <Table className="h-4 w-4" />
                  <span className="font-medium">Analysis</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-6">
                <MoodTrendChart data={trendData} title={`Mood Trend Analysis (${dateRange} days)`} />
              </TabsContent>

              <TabsContent value="issues" className="space-y-6">
                <IssuesFrequencyChart data={issuesFrequencyData} title="Issues Frequency Analysis" onDrillDown={handleDrillDown} />
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <CalendarHeatmap data={calendarHeatmapData} title="Issues Calendar Heatmap" />
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <MoodByIssueTable data={moodByIssueData} title="Mood Analysis by Issue Type" />
              </TabsContent>
            </Tabs>
          </>}
      </div>
    </Layout>;
};
export default MoodInsights;