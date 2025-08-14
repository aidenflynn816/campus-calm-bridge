import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarHeatmapData } from "@/hooks/useCounselorMoodData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

interface CalendarHeatmapProps {
  data: CalendarHeatmapData[];
  title?: string;
}

const CalendarHeatmap = ({ data, title = "Issues Calendar Heatmap" }: CalendarHeatmapProps) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getHeatmapData = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return data.find(item => item.date === dateString);
  };

  const getHeatClass = (level: number) => {
    const baseClass = "w-8 h-8 rounded-sm border border-border cursor-pointer transition-all hover:scale-110";
    switch (level) {
      case 0: return `${baseClass} bg-bridge-muted/20`;
      case 1: return `${baseClass} bg-yellow-200 hover:bg-yellow-300`;
      case 2: return `${baseClass} bg-orange-300 hover:bg-orange-400`;
      case 3: return `${baseClass} bg-red-400 hover:bg-red-500`;
      case 4: return `${baseClass} bg-red-600 hover:bg-red-700`;
      default: return `${baseClass} bg-bridge-muted/20`;
    }
  };

  const getLegendClass = (level: number) => {
    switch (level) {
      case 0: return "bg-bridge-muted/20";
      case 1: return "bg-yellow-200";
      case 2: return "bg-orange-300";
      case 3: return "bg-red-400";
      case 4: return "bg-red-600";
      default: return "bg-bridge-muted/20";
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
    <Card className="bridge-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-bridge-text/70">
          Daily issue frequency in {format(today, 'MMMM yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-medium text-bridge-text/70 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {calendarWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={dayIndex} className="w-8 h-8" />;
                  }

                  const heatmapData = getHeatmapData(date);
                  const level = heatmapData?.level || 0;
                  const issueCount = heatmapData?.issueCount || 0;
                  const isToday = date.toDateString() === today.toDateString();

                  return (
                    <div
                      key={dayIndex}
                      className={`${getHeatClass(level)} ${isToday ? 'ring-2 ring-bridge-primary' : ''} 
                        flex items-center justify-center group relative`}
                      title={`${format(date, 'MMM d')}: ${issueCount} issues`}
                    >
                      <span className="text-xs font-medium">
                        {format(date, 'd')}
                      </span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                        px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 
                        transition-opacity z-10 whitespace-nowrap">
                        {format(date, 'MMM d')}: {issueCount} issues
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-bridge-text/70">Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getLegendClass(level)}`}
                />
              ))}
              <span className="text-sm text-bridge-text/70">More</span>
            </div>
            
            <div className="text-sm text-bridge-text/70">
              Max: {maxIssues} issues/day
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-border">
            <div>
              <p className="text-2xl font-bold text-bridge-primary">
                {data.reduce((sum, item) => sum + item.issueCount, 0)}
              </p>
              <p className="text-sm text-bridge-text/70">Total Issues</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-bridge-primary">
                {data.filter(item => item.issueCount > 0).length}
              </p>
              <p className="text-sm text-bridge-text/70">Active Days</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-bridge-primary">
                {maxIssues}
              </p>
              <p className="text-sm text-bridge-text/70">Peak Day</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarHeatmap;