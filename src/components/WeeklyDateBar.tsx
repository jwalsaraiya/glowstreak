
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeeklyDateBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WeeklyDateBar: React.FC<WeeklyDateBarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(selectedDate));
  
  useEffect(() => {
    // Update week if selected date changes to a different week
    const selectedWeekStart = startOfWeek(selectedDate);
    if (!isSameDay(selectedWeekStart, currentWeekStart)) {
      setCurrentWeekStart(selectedWeekStart);
    }
  }, [selectedDate, currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const daysToAdd = direction === 'next' ? 7 : -7;
    const newWeekStart = addDays(currentWeekStart, daysToAdd);
    setCurrentWeekStart(newWeekStart);
    
    // Select the same day of week in the new week
    const dayOfWeek = selectedDate.getDay();
    const newDate = addDays(newWeekStart, dayOfWeek);
    onDateSelect(newDate);
  };
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(currentWeekStart, i);
    const isToday = isSameDay(date, new Date());
    const isSelected = isSameDay(date, selectedDate);
    
    return {
      date,
      dayOfWeek: format(date, 'E'),
      dayOfMonth: format(date, 'd'),
      isToday,
      isSelected
    };
  });

  return (
    <div className="bg-card rounded-lg border p-2">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateWeek('prev')}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium">
          {format(currentWeekStart, 'MMMM d')} - {format(addDays(currentWeekStart, 6), 'MMMM d, yyyy')}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateWeek('next')}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, index) => (
          <div 
            key={index}
            onClick={() => onDateSelect(day.date)}
            className={cn(
              "flex flex-col items-center p-2 rounded-md cursor-pointer transition-colors",
              day.isSelected ? "bg-primary text-primary-foreground" : 
              day.isToday ? "bg-muted" : "hover:bg-accent/50"
            )}
          >
            <span className="text-xs font-medium">{day.dayOfWeek}</span>
            <span className="text-lg font-bold mt-1">{day.dayOfMonth}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyDateBar;
