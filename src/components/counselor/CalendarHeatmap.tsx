import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarHeatmapData } from "@/hooks/useCounselorMoodData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
interface CalendarHeatmapProps {
  data: CalendarHeatmapData[];
  title?: string;
}
const CalendarHeatmap = ({
  data,
  title = "Issues Calendar Heatmap"
}: CalendarHeatmapProps) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });
  const getHeatmapData = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return data.find(item => item.date === dateString);
  };
  const getHeatClass = (level: number) => {
    const baseClass = "w-8 h-8 rounded-sm border border-border cursor-pointer transition-all hover:scale-110";
    switch (level) {
      case 0:
        return `${baseClass} bg-bridge-muted/20`;
      case 1:
        return `${baseClass} bg-yellow-200 hover:bg-yellow-300`;
      case 2:
        return `${baseClass} bg-orange-300 hover:bg-orange-400`;
      case 3:
        return `${baseClass} bg-red-400 hover:bg-red-500`;
      case 4:
        return `${baseClass} bg-red-600 hover:bg-red-700`;
      default:
        return `${baseClass} bg-bridge-muted/20`;
    }
  };
  const getLegendClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-bridge-muted/20";
      case 1:
        return "bg-yellow-200";
      case 2:
        return "bg-orange-300";
      case 3:
        return "bg-red-400";
      case 4:
        return "bg-red-600";
      default:
        return "bg-bridge-muted/20";
    }
  };

  // Create calendar grid with proper week structure
  const calendarWeeks = [];
  let currentWeek = [];

  // Add empty cells for days before month start
  const startDay = getDay(monthStart);
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  // Add days of the month
  daysInMonth.forEach(date => {
    if (currentWeek.length === 7) {
      calendarWeeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });

  // Add remaining week if it has days
  if (currentWeek.length > 0) {
    // Fill remaining days with null
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    calendarWeeks.push(currentWeek);
  }
  const maxIssues = Math.max(...data.map(item => item.issueCount), 1);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        
        <div className="space-y-1">
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <div key={dayIndex} className="w-8 h-8" />;
                }
                
                const heatmapData = getHeatmapData(date);
                const issueLevel = heatmapData ? Math.min(Math.floor((heatmapData.issueCount / maxIssues) * 4), 4) : 0;
                
                return (
                  <div
                    key={dayIndex}
                    className={getHeatClass(issueLevel)}
                    title={`${format(date, 'MMM d')}: ${heatmapData?.issueCount || 0} issues`}
                  >
                    <span className="flex items-center justify-center h-full text-xs font-medium">
                      {format(date, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getLegendClass(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};
export default CalendarHeatmap;