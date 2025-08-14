import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DAILY_ISSUES } from "@/hooks/useMoodCheckins";

interface IssuesData {
  issue: string;
  count: number;
}

interface IssuesChartProps {
  data: IssuesData[];
  title?: string;
}

const IssuesChart = ({ data, title = "Issues Frequency" }: IssuesChartProps) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const count = payload[0].value;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-bridge-text">{label}</p>
          <p className="text-bridge-primary">
            <span className="font-medium">Times encountered: {count}</span>
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
            <p>No issues data available yet.</p>
            <p className="text-sm mt-1">Check-in with some issues to see your frequency chart!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bridge-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-bridge-text/70">
          Frequency of issues encountered in your check-ins
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
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-bridge-primary">
                {data.reduce((sum, item) => sum + item.count, 0)}
              </p>
              <p className="text-sm text-bridge-text/70">Total Issues</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-bridge-primary">
                {data.filter(item => item.count > 0).length}
              </p>
              <p className="text-sm text-bridge-text/70">Issue Types</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-bridge-primary">
                {data.length > 0 ? Math.max(...data.map(item => item.count)) : 0}
              </p>
              <p className="text-sm text-bridge-text/70">Most Frequent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-bridge-primary">
                {data.length > 0 ? (data.reduce((sum, item) => sum + item.count, 0) / data.filter(item => item.count > 0).length || 0).toFixed(1) : 0}
              </p>
              <p className="text-sm text-bridge-text/70">Avg per Type</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssuesChart;