import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";

interface AddHabitDialogProps {
  onAddHabit: (name: string) => void;
}

export function AddHabitDialog({ onAddHabit }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [habitName, setHabitName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim()) {
      onAddHabit(habitName.trim());
      setHabitName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track daily. You can edit or remove it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Morning exercise, Read for 30 minutes..."
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!habitName.trim()}>
              Add Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

