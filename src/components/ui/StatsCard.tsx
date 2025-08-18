'use client';

import { Card, CardContent, Typography, Box, SvgIcon } from '@mui/material';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  trend 
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card 
      data-testid="stat-card"
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              data-testid="stat-label"
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="text.primary"
              sx={{ mb: 1 }}
              data-testid="stat-value"
            >
              {formatValue(value)}
            </Typography>
            {trend && (
              <Typography 
                variant="body2" 
                color={trend.value >= 0 ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 500 }}
              >
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </Typography>
            )}
          </Box>
          
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgIcon sx={{ fontSize: 28 }}>
              {icon}
            </SvgIcon>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}