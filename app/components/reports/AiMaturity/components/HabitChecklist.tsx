import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2 } from "lucide-react";

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

interface HabitChecklistProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  completedCount: number;
  date: Date;
}

export function HabitChecklist({ habits, onToggleHabit, completedCount, date }: HabitChecklistProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Today's Habits</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(date)}
          </span>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4" />
          <span>{completedCount} of {habits.length} completed</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={habit.id}
              checked={habit.completed}
              onCheckedChange={() => onToggleHabit(habit.id)}
            />
            <label
              htmlFor={habit.id}
              className={`flex-1 cursor-pointer select-none ${
                habit.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {habit.name}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

