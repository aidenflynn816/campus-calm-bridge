import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOOD_OPTIONS } from "@/hooks/useMoodCheckins";

interface MoodChartProps {
  data: Array<{
    date: string;
    mood: number;
    emoji: string;
    notes?: string;
  }>;
  title?: string;
}

const MoodChart = ({ data, title = "Mood Trend" }: MoodChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const moodOption = MOOD_OPTIONS.find(option => option.rating === data.mood);
      
      return (
        <div className="bg-white border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            {moodOption && (
              <moodOption.icon 
                size={20} 
                className={moodOption.color}
              />
            )}
            <span className="text-sm text-bridge-text/70">
              {moodOption?.label || `Mood ${data.mood}`}
            </span>
          </div>
          {data.notes && (
            <p className="text-sm text-bridge-text/80 mt-1 max-w-48">
              "{data.notes}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number): string => {
    const moodOption = MOOD_OPTIONS.find(option => option.rating === value);
    return moodOption?.label.charAt(0) || value.toString();
  };

  if (data.length === 0) {
    return (
      <Card className="bridge-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-bridge-text/60">
            <p>No mood data available yet.</p>
            <p className="text-sm mt-1">Start tracking your mood to see trends!</p>
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
          Track your mood patterns over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-sm"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={formatYAxisTick}
                className="text-sm"
                tick={{ fontSize: 16 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
          {MOOD_OPTIONS.map(option => (
            <div key={option.rating} className="flex items-center gap-1">
              <option.icon size={18} className={option.color} />
              <span className="text-bridge-text/70">{option.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodChart;