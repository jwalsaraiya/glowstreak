
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, CheckCheck, Clock, Flame, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock data
const weeklyCompletionData = [
  { name: 'Mon', value: 90 },
  { name: 'Tue', value: 80 },
  { name: 'Wed', value: 100 },
  { name: 'Thu', value: 70 },
  { name: 'Fri', value: 85 },
  { name: 'Sat', value: 75 },
  { name: 'Sun', value: 95 },
];

const categoryData = [
  { name: 'Health', value: 35 },
  { name: 'Fitness', value: 25 },
  { name: 'Learning', value: 20 },
  { name: 'Mindfulness', value: 15 },
  { name: 'Productivity', value: 5 },
];

const COLORS = ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];

const habitStrengthData = [
  { name: 'Morning Meditation', value: 90, streak: 12 },
  { name: 'Read a Book', value: 75, streak: 5 },
  { name: 'Exercise', value: 80, streak: 8 },
  { name: 'Drink Water', value: 95, streak: 15 },
  { name: 'Journal', value: 60, streak: 3 },
];

const AnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
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
            <div className="text-4xl font-bold mb-2">85%</div>
            <p className="text-sm text-muted-foreground mb-4">Overall habit completion rate</p>
            <Progress value={85} className="h-2" />
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
            <div className="text-4xl font-bold mb-2">15 days</div>
            <p className="text-sm text-muted-foreground mb-4">Drink Water</p>
            <Progress value={75} className="h-2" />
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
            <div className="text-4xl font-bold mb-2">72 min</div>
            <p className="text-sm text-muted-foreground mb-4">Spent on habits daily</p>
            <Progress value={60} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Weekly Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyCompletionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
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

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Habits by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="w-full max-w-xs">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
            {habitStrengthData.map((habit, index) => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
