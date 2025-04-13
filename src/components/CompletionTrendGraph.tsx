
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DataItem {
  name: string;
  value: number;
  tooltip?: string;
  totalDays?: number;
  completedDays?: number;
}

interface CompletionTrendGraphProps {
  data: DataItem[];
  range: 'weekly' | 'monthly';
  isDarkTheme: boolean;
}

export const CompletionTrendGraph: React.FC<CompletionTrendGraphProps> = ({
  data,
  range,
  isDarkTheme
}) => {
  const primaryColor = '#0d968b';
  
  // Calculate the average completion rate
  const avgCompletion = data.length 
    ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length) 
    : 0;

  // Determine chart dimensions based on data length
  const getChartWidth = () => {
    const minBarWidth = range === 'weekly' ? 60 : 80; // Minimum width per bar
    return Math.max(data.length * minBarWidth, 800); // Ensure minimum width
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0].payload;
    
    return (
      <div className={`px-3 py-2 rounded-md shadow-lg ${isDarkTheme ? 'bg-background border border-border' : 'bg-white'}`}>
        <p className="font-medium text-sm">
          {range === 'weekly' 
            ? item.tooltip || label 
            : `${label}: ${item.completedDays || 0}/${item.totalDays || 0} days`}
        </p>
        <p className="font-bold text-lg mt-1 text-primary">
          {payload[0].value}% <span className="text-xs font-normal text-muted-foreground">completed</span>
        </p>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-grow w-full" style={{ minHeight: '260px' }}>
        <ScrollArea className="h-full" orientation="horizontal">
          <div 
            style={{ 
              width: `${getChartWidth()}px`, 
              height: '100%',
              minHeight: '260px'
            }}
          >
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
              barCategoryGap={range === 'weekly' ? 12 : 16}
              barSize={range === 'weekly' ? 40 : 60}
              height={260}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkTheme ? '#33333a' : '#eee'} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
                axisLine={{ stroke: isDarkTheme ? '#33333a' : '#eee' }}
                tickLine={false}
                height={30}
              />
              <YAxis 
                unit="%" 
                domain={[0, 100]} 
                tickMargin={10} 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: isDarkTheme ? '#33333a' : '#eee' }}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]} 
                className="hover:opacity-80 transition-opacity"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= avgCompletion ? primaryColor : (isDarkTheme ? '#555' : '#d4d4d8')} 
                  />
                ))}
              </Bar>
            </BarChart>
          </div>
        </ScrollArea>
      </div>
      
      {/* Average display below the graph */}
      <div className="mt-4 flex items-center justify-center">
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <div 
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <span>Average Completion: <span className="font-semibold">{avgCompletion}%</span></span>
        </Badge>
      </div>
    </div>
  );
};
