import { useState } from "react";
import Layout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCounselorMoodData } from "@/hooks/useCounselorMoodData";
import MoodOverviewMetrics from "@/components/counselor/MoodOverviewMetrics";
import MoodTrendChart from "@/components/counselor/MoodTrendChart";
import IssuesFrequencyChart from "@/components/counselor/IssuesFrequencyChart";
import CalendarHeatmap from "@/components/counselor/CalendarHeatmap";
import MoodByIssueTable from "@/components/counselor/MoodByIssueTable";
import { BarChart3, TrendingUp, Calendar, Table, AlertCircle } from "lucide-react";
const MoodInsights = () => {
  const [dateRange, setDateRange] = useState(30);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const {
    moodData,
    isLoading,
    getOverviewMetrics,
    getMoodTrendData,
    getIssueFrequencyData,
    getCalendarHeatmapData,
    getMoodByIssueData
  } = useCounselorMoodData(dateRange);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-bridge-primary">Mood Data Insights</h1>
            <p className="text-lg text-bridge-text/70 mt-1">
              Comprehensive analytics of student mood check-ins and issues
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="group-a">Group A</SelectItem>
                <SelectItem value="group-b">Group B</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange.toString()} onValueChange={value => setDateRange(parseInt(value))}>
              <SelectTrigger className="w-32">
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
        {moodData.length === 0 && <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">No mood data available</p>
                  <p className="text-sm text-yellow-700">
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
              <TabsList className="bg-bridge-muted/30">
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="issues" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Issues
                </TabsTrigger>
                
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Analysis
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