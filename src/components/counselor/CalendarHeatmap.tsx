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
    const baseClass = "w-10 h-10 rounded-md border cursor-pointer transition-all hover:scale-110 hover:shadow-md flex items-center justify-center";
    switch (level) {
      case 0:
        return `${baseClass} bg-muted/30 border-border hover:bg-muted/50`;
      case 1:
        return `${baseClass} bg-yellow-100 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-300`;
      case 2:
        return `${baseClass} bg-orange-200 border-orange-300 hover:bg-orange-300 hover:border-orange-400`;
      case 3:
        return `${baseClass} bg-red-300 border-red-400 hover:bg-red-400 hover:border-red-500`;
      case 4:
        return `${baseClass} bg-red-500 border-red-600 hover:bg-red-600 hover:border-red-700 text-white`;
      default:
        return `${baseClass} bg-muted/30 border-border hover:bg-muted/50`;
    }
  };
  const getLegendClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted/30 border border-border";
      case 1:
        return "bg-yellow-100 border border-yellow-200";
      case 2:
        return "bg-orange-200 border border-orange-300";
      case 3:
        return "bg-red-300 border border-red-400";
      case 4:
        return "bg-red-500 border border-red-600";
      default:
        return "bg-muted/30 border border-border";
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
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily issue frequency visualization
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-7 gap-2 text-sm font-semibold text-muted-foreground mb-3 px-1">
          <div className="text-center">S</div>
          <div className="text-center">M</div>
          <div className="text-center">T</div>
          <div className="text-center">W</div>
          <div className="text-center">T</div>
          <div className="text-center">F</div>
          <div className="text-center">S</div>
        </div>
        
        <div className="space-y-2">
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <div key={dayIndex} className="w-10 h-10" />;
                }
                
                const heatmapData = getHeatmapData(date);
                const issueLevel = heatmapData ? Math.min(Math.floor((heatmapData.issueCount / maxIssues) * 4), 4) : 0;
                
                return (
                  <div
                    key={dayIndex}
                    className={getHeatClass(issueLevel)}
                    title={`${format(date, 'MMM d')}: ${heatmapData?.issueCount || 0} issues`}
                  >
                    <span className={`text-xs font-bold ${issueLevel === 4 ? 'text-white' : 'text-foreground'}`}>
                      {format(date, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mt-6 pt-4 border-t border-border">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-4 h-4 rounded ${getLegendClass(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};
export default CalendarHeatmap;