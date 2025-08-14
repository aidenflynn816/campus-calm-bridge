import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { MoodByIssueData } from "@/hooks/useCounselorMoodData";

interface MoodByIssueTableProps {
  data: MoodByIssueData[];
  title?: string;
}

type SortField = 'issue' | 'averageMood' | 'occurrences' | 'severity';
type SortDirection = 'asc' | 'desc';

const MoodByIssueTable = ({ data, title = "Mood Analysis by Issue" }: MoodByIssueTableProps) => {
  const [sortField, setSortField] = useState<SortField>('averageMood');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle severity sorting
    if (sortField === 'severity') {
      const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      aValue = severityOrder[a.severity];
      bValue = severityOrder[b.severity];
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return 'text-red-600';
    if (mood <= 3.5) return 'text-orange-600';
    return 'text-green-600';
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bridge-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-bridge-text/60">
            <p>No mood by issue data available yet.</p>
            <p className="text-sm mt-1">Data will appear as students report issues in their check-ins.</p>
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
          Average mood scores for each type of issue (sortable by severity)
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('issue')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Issue Type
                    {getSortIcon('issue')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('averageMood')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Avg Mood
                    {getSortIcon('averageMood')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('occurrences')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Occurrences
                    {getSortIcon('occurrences')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('severity')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Severity
                    {getSortIcon('severity')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow key={index} className="hover:bg-bridge-muted/30">
                  <TableCell className="font-medium">
                    {item.issue}
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getMoodColor(item.averageMood)}`}>
                      {item.averageMood}/5
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-bridge-text">
                      {item.occurrences}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getSeverityBadgeVariant(item.severity)}
                      className={`${getSeverityColor(item.severity)} capitalize`}
                    >
                      {item.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {sortedData.filter(item => item.severity === 'high').length}
              </p>
              <p className="text-sm text-bridge-text/70">High Severity</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {sortedData.filter(item => item.severity === 'medium').length}
              </p>
              <p className="text-sm text-bridge-text/70">Medium Severity</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {sortedData.filter(item => item.severity === 'low').length}
              </p>
              <p className="text-sm text-bridge-text/70">Low Severity</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodByIssueTable;