
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, LayoutGrid } from 'lucide-react';

interface CalendarEvent {
  date: Date;
  type: 'habit' | 'event';
  title: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const today = new Date();

  // Transform events into a map for easier lookup
  const eventsByDate = events.reduce((acc, event) => {
    const dateStr = event.date.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="month">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="month" className="mt-0 space-y-4">
            <Calendar
              mode="single"
              selected={today}
              className="p-4"
              modifiers={{
                booked: Object.keys(eventsByDate).map(dateStr => new Date(dateStr)),
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                  borderRadius: "0.5rem",
                }
              }}
            />
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <div className="p-4 grid grid-cols-7 gap-1 text-center text-sm font-medium">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="px-4 pb-4 grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() - today.getDay() + i);
                const dateStr = date.toDateString();
                const dayEvents = eventsByDate[dateStr] || [];
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div key={i} className="flex flex-col">
                    <div className={`mb-1 h-8 w-8 rounded-full flex items-center justify-center mx-auto ${
                      isToday ? 'bg-primary text-primary-foreground' : ''
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="flex flex-col gap-1">
                      {dayEvents.map((event, idx) => (
                        <Badge 
                          key={idx}
                          variant={event.type === 'habit' ? 'default' : 'outline'}
                          className="truncate text-xs py-0.5"
                        >
                          {event.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
