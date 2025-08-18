'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartData } from '@/types';

interface SalesChartProps {
  data: ChartData[];
  title?: string;
}

export function SalesChart({ data, title = 'Visão Geral de Vendas' }: SalesChartProps) {
  return (
    <Card sx={{ height: '100%' }} data-testid="sales-chart">
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 300 }} data-testid="chart-container">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Vendas']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#d32f2f"
                strokeWidth={3}
                dot={{ fill: '#d32f2f', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#d32f2f', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}