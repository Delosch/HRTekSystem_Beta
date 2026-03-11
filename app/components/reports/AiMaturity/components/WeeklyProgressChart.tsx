import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface DayProgress {
  day: string;
  completed: number;
  total: number;
  percentage: number;
}

interface WeeklyProgressChartProps {
  weekData: DayProgress[];
}

export function WeeklyProgressChart({ weekData }: WeeklyProgressChartProps) {
  // Calculate weekly average
  const weeklyAverage = weekData.length > 0
    ? Math.round(weekData.reduce((sum, day) => sum + day.percentage, 0) / weekData.length)
    : 0;

  const getBarColor = (percentage: number) => {
    if (percentage === 100) return "hsl(142, 76%, 36%)"; // Green
    if (percentage >= 75) return "hsl(142, 76%, 50%)"; // Light green
    if (percentage >= 50) return "hsl(43, 96%, 56%)"; // Yellow
    if (percentage > 0) return "hsl(25, 95%, 53%)"; // Orange
    return "hsl(0, 0%, 85%)"; // Gray
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Progress</span>
          <span className="text-sm text-muted-foreground">
            Average: {weeklyAverage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))"
              }}
              formatter={(value: number, name: string, props: any) => [
                `${props.payload.completed}/${props.payload.total} habits (${value}%)`,
                "Completion"
              ]}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {weekData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

