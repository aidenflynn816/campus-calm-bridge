import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { IssueFrequencyData } from "@/hooks/useCounselorMoodData";

interface IssuesFrequencyChartProps {
  data: IssueFrequencyData[];
  title?: string;
  onDrillDown?: (issue: string, period: string) => void;
}

const IssuesFrequencyChart = ({ data, title = "Issues Frequency Analysis", onDrillDown }: IssuesFrequencyChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'past7Days' | 'past30Days'>('past7Days');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const todayCount = payload.find((p: any) => p.dataKey === 'today')?.value || 0;
      const past7DaysCount = payload.find((p: any) => p.dataKey === 'past7Days')?.value || 0;
      const past30DaysCount = payload.find((p: any) => p.dataKey === 'past30Days')?.value || 0;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-bridge-text mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="font-medium">Today: {todayCount}</span>
            </p>
            <p className="text-green-600">
              <span className="font-medium">Past 7 days: {past7DaysCount}</span>
            </p>
            <p className="text-purple-600">
              <span className="font-medium">Past 30 days: {past30DaysCount}</span>
            </p>
          </div>
          {onDrillDown && (
            <p className="text-xs text-bridge-text/70 mt-2">Click to drill down</p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (onDrillDown && data?.issue) {
      onDrillDown(data.issue, selectedPeriod);
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bridge-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-bridge-text/60">
            <p>No issues frequency data available yet.</p>
            <p className="text-sm mt-1">Data will appear as students report issues in their check-ins.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className="inline-flex gap-1 p-1 bg-muted/50 rounded-lg">
            <Button
              variant={selectedPeriod === 'today' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('today')}
              className="rounded-md font-medium"
            >
              Today
            </Button>
            <Button
              variant={selectedPeriod === 'past7Days' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('past7Days')}
              className="rounded-md font-medium"
            >
              7 Days
            </Button>
            <Button
              variant={selectedPeriod === 'past30Days' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('past30Days')}
              className="rounded-md font-medium"
            >
              30 Days
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Frequency of issues reported across all students
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="issue" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {selectedPeriod === 'today' && (
                <Bar 
                  dataKey="today" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  name="Today"
                />
              )}
              
              {selectedPeriod === 'past7Days' && (
                <Bar 
                  dataKey="past7Days" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  name="Past 7 Days"
                />
              )}
              
              {selectedPeriod === 'past30Days' && (
                <Bar 
                  dataKey="past30Days" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  name="Past 30 Days"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-border bg-muted/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-blue-600">
                {data.reduce((sum, item) => sum + item.today, 0)}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Today</p>
            </div>
            <div className="text-center space-y-1 border-x border-border">
              <p className="text-3xl font-bold text-green-600">
                {data.reduce((sum, item) => sum + item.past7Days, 0)}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Past 7 Days</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-purple-600">
                {data.reduce((sum, item) => sum + item.past30Days, 0)}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Past 30 Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssuesFrequencyChart;