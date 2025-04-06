
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  Calendar, CheckCheck, Clock, Flame, TrendingUp, 
  ArrowRight, ArrowUp, Zap 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, differenceInDays } from 'date-fns';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Fetch user's habits, events, and tasks data
  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        setHabits(parsedData.habits || []);
        setEvents(parsedData.events || []);
        setTasks(parsedData.tasks || []);
      }
    }
  }, [user]);

  // Calculate real analytics data based on actual habits, events, and tasks
  useEffect(() => {
    if (!habits.length && !user) return;

    // Calculate date ranges
    const today = new Date();
    const lastWeekStart = subDays(today, 6);
    const weekData = eachDayOfInterval({ start: lastWeekStart, end: today });

    // Weekly completion data
    const weeklyCompletionData = weekData.map(date => {
      // Get all habits that should have been completed on this date
      const totalHabitsForDay = habits.length;
      
      // Count habits actually completed on this date
      const completedHabitsForDay = habits.filter(habit => 
        habit.completionDates?.some((dateStr: string) => 
          isSameDay(new Date(dateStr), date)
        )
      ).length;
      
      // Calculate completion percentage
      const completionPercentage = totalHabitsForDay > 0 
        ? Math.round((completedHabitsForDay / totalHabitsForDay) * 100) 
        : 0;
      
      return {
        name: format(date, 'EEE'),
        value: completionPercentage,
        date: date.toISOString(),
      };
    });

    // Calculate overall completion rate (average of the week)
    const overallCompletionRate = Math.round(
      weeklyCompletionData.reduce((sum, item) => sum + item.value, 0) / weeklyCompletionData.length
    );

    // Calculate habit strength data
    const habitStrengthData = habits.map(habit => {
      // Calculate current streak
      const sortedCompletionDates = (habit.completionDates || [])
        .map((dateStr: string) => new Date(dateStr))
        .sort((a: Date, b: Date) => b.getTime() - a.getTime());
      
      let streak = 0;
      if (sortedCompletionDates.length > 0) {
        // Check if habit completed today
        const isCompletedToday = sortedCompletionDates.some(date => 
          isSameDay(date, today)
        );

        if (isCompletedToday) {
          streak = 1;
          let previousDate = today;
          
          // Count back from yesterday
          for (let i = 1; i < sortedCompletionDates.length; i++) {
            const expectedDate = subDays(previousDate, 1);
            const isCompleted = sortedCompletionDates.some(date => 
              isSameDay(date, expectedDate)
            );
            
            if (isCompleted) {
              streak++;
              previousDate = expectedDate;
            } else {
              break;
            }
          }
        }
      }
      
      // Calculate completion percentage
      const daysToConsider = Math.min(30, differenceInDays(today, new Date(habit.startDate)) + 1);
      const completedDays = (habit.completionDates || []).length;
      const completionPercentage = daysToConsider > 0 
        ? Math.round((completedDays / daysToConsider) * 100)
        : 0;

      return {
        name: habit.title,
        value: completionPercentage,
        streak: streak,
      };
    });

    // Find longest streak
    const longestStreakHabit = habitStrengthData.length > 0 
      ? habitStrengthData.reduce((max, habit) => (habit.streak > max.streak ? habit : max), habitStrengthData[0])
      : { name: 'No habits yet', streak: 0, value: 0 };

    // Calculate daily time spent (estimated based on number of completed items)
    const completedItemsToday = [
      ...habits.filter(h => h.completionDates?.some((d: string) => isSameDay(new Date(d), today))),
      ...tasks.filter(t => t.isCompleted && isSameDay(new Date(t.date), today)),
      ...events.filter(e => e.isCompleted && isSameDay(new Date(e.date), today))
    ].length;
    
    // Estimate 10 minutes per completed item
    const dailyTimeSpent = completedItemsToday * 10;

    // Monthly trend data
    const monthlyTrendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const totalHabitsForDay = habits.length;
      const completedHabitsForDay = habits.filter(habit => 
        habit.completionDates?.some((dateStr: string) => 
          isSameDay(new Date(dateStr), date)
        )
      ).length;
      
      const completionPercentage = totalHabitsForDay > 0 
        ? Math.round((completedHabitsForDay / totalHabitsForDay) * 100) 
        : 0;
      
      monthlyTrendData.push({
        date: date.toISOString(),
        completion: completionPercentage,
      });
    }

    setAnalyticsData({
      weeklyCompletionData,
      habitStrengthData,
      overallCompletionRate,
      longestStreakHabit,
      dailyTimeSpent,
      monthlyTrendData,
    });
  }, [habits, tasks, events, user, range]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress and see your habits analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <CheckCheck className="mr-2 h-5 w-5" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{analyticsData.overallCompletionRate}%</div>
            <p className="text-sm text-muted-foreground mb-4">Overall habit completion rate</p>
            <Progress value={analyticsData.overallCompletionRate} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1 text-primary" />
              <span>Keep up the good work!</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Flame className="mr-2 h-5 w-5" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{analyticsData.longestStreakHabit.streak} days</div>
            <p className="text-sm text-muted-foreground mb-4">{analyticsData.longestStreakHabit.name}</p>
            <Progress value={(analyticsData.longestStreakHabit.streak / 30) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <Zap className="h-3 w-3 mr-1 text-primary" />
              <span>Keep going to reach 30 days!</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{analyticsData.dailyTimeSpent} min</div>
            <p className="text-sm text-muted-foreground mb-4">Spent on habits daily</p>
            <Progress value={(analyticsData.dailyTimeSpent / 120) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <ArrowRight className="h-3 w-3 mr-1 text-primary" />
              <span>Consistent with your goals</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Completion Trend
              </CardTitle>
              <Select 
                value={range} 
                onValueChange={(value: 'week' | 'month' | 'year') => setRange(value)}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.weeklyCompletionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    contentStyle={{ borderRadius: '0.5rem' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Habit Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.habitStrengthData.map((habit: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{habit.name}</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="rounded-full">
                      {habit.streak} days
                    </Badge>
                    <span className="text-sm font-semibold">{habit.value}%</span>
                  </div>
                </div>
                <Progress value={habit.value} className="h-2" />
              </div>
            ))}
            
            {analyticsData.habitStrengthData.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No habits data available yet. Start adding habits to see your analytics!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
