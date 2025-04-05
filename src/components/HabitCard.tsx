
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HabitCardProps {
  title: string;
  description?: string;
  category: string;
  streak: number;
  priority: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
  isOneTime?: boolean;
  className?: string;
  onClick?: () => void;
  onDelete?: () => void;
}

const priorityClasses = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  high: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
};

const HabitCard: React.FC<HabitCardProps> = ({
  title,
  description,
  category,
  streak,
  priority,
  isCompleted = false,
  isOneTime = false,
  className,
  onClick,
  onDelete,
}) => {
  const hasLongStreak = streak >= 5 && !isOneTime;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <Card
      className={cn(
        "relative h-full transition-all duration-300 border",
        isCompleted ? "opacity-75 bg-secondary/50" : "bg-card",
        hasLongStreak && !isCompleted ? "streak-card" : "",
        "hover:cursor-pointer hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      {hasLongStreak && !isCompleted && <div className="streak-glow"></div>}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col space-y-1 pr-8">
            <h3 className={cn("font-medium text-lg", isCompleted && "line-through opacity-70")}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>
          {isCompleted ? (
            <CheckCircle className="h-6 w-6 text-primary" />
          ) : (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-1" />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Badge className="rounded-full text-xs">{category}</Badge>
          <div className="flex flex-wrap gap-2 justify-end">
            <Badge variant="outline" className={cn("rounded-full text-xs", priorityClasses[priority])}>
              {priority}
            </Badge>
            {streak > 0 && !isOneTime && (
              <Badge 
                className={cn(
                  "rounded-full font-semibold",
                  hasLongStreak ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                {streak} day{streak !== 1 ? 's' : ''}
              </Badge>
            )}
            {isOneTime && (
              <Badge variant="outline" className="rounded-full text-xs">
                One-time
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      {onDelete && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive z-10" 
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
};

export default HabitCard;
