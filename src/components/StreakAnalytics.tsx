
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StreakData {
  name: string;
  currentStreak: number;
  longestStreak: number;
  completion: number;
}

interface StreakAnalyticsProps {
  streaks: StreakData[];
}

const StreakAnalytics: React.FC<StreakAnalyticsProps> = ({ streaks }) => {
  const totalCompletionAvg = streaks.reduce((sum, streak) => sum + streak.completion, 0) / streaks.length;
  
  const topStreak = [...streaks].sort((a, b) => b.currentStreak - a.currentStreak)[0];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Streak Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center bg-secondary/40 rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">{Math.round(totalCompletionAvg)}%</div>
            <div className="text-sm text-muted-foreground">Weekly Completion</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-secondary/40 rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">{topStreak?.currentStreak || 0}</div>
            <div className="text-sm text-muted-foreground">Longest Active Streak</div>
          </div>
        </div>
        
        <h3 className="font-medium text-base mb-4">Top Streaks</h3>
        <div className="space-y-4">
          {streaks.slice(0, 3).map((streak, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {i === 0 && streak.currentStreak > 7 ? (
                    <Flame className="mr-2 h-5 w-5 text-primary animate-pulse-glow" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{streak.name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold">{streak.currentStreak} days</span>
                </div>
              </div>
              <Progress value={streak.completion} className="h-2" />
            </div>
          ))}
        </div>

        {streaks.some(s => s.currentStreak >= 10) && (
          <div className="mt-6 flex items-center justify-center p-3 bg-primary/10 rounded-lg animate-float">
            <Trophy className="h-5 w-5 text-primary mr-2" />
            <span className="text-sm font-medium">Milestone reached! Keep going!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakAnalytics;
