import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { MoodTrendData } from "@/hooks/useCounselorMoodData";

interface MoodTrendChartProps {
  data: MoodTrendData[];
  title?: string;
}

const MoodTrendChart = ({ data, title = "Mood Trend Analysis" }: MoodTrendChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const averageMood = payload[0].value;
      const checkinsCount = payload[1]?.value || 0;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-bridge-text">{label}</p>
          <p className="text-bridge-primary">
            <span className="font-medium">Average Mood: {averageMood}</span>
          </p>
          <p className="text-bridge-text/70">
            <span className="text-sm">Check-ins: {checkinsCount}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bridge-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-bridge-text/60">
            <p>No mood trend data available yet.</p>
            <p className="text-sm mt-1">Data will appear as students submit mood check-ins.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average mood scores across all students over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left"
                domain={[1, 5]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Average Mood', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: 'Check-ins', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageMood" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                name="Average Mood"
                yAxisId="left"
              />
              <Line 
                type="monotone" 
                dataKey="checkinsCount" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 1, r: 3 }}
                name="Check-ins Count"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-border bg-muted/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-primary">
                {data.length > 0 ? (data.reduce((sum, item) => sum + item.averageMood, 0) / data.length).toFixed(1) : 0}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Avg Mood</p>
            </div>
            <div className="text-center space-y-1 border-x border-border">
              <p className="text-3xl font-bold text-primary">
                {data.reduce((sum, item) => sum + item.checkinsCount, 0)}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Total Check-ins</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-primary">
                {data.filter(item => item.checkinsCount > 0).length}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Active Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodTrendChart;