"use client";

import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import type { RecentActivity } from "../lib/dashboard-data";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

/**
 * Client component for recent activities display
 * Handles the color logic and interactive chip styling
 */
export function RecentActivities({ activities }: RecentActivitiesProps) {
  /**
   * Returns chip color based on activity type
   */
  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user":
        return "primary";
      case "product":
        return "secondary";
      case "order":
        return "success";
      case "auth":
        return "info";
      case "sale":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Atividade Recente
      </Typography>
      <List disablePadding>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <ListItem
              key={activity.id}
              divider={index < activities.length - 1}
              sx={{ px: 0 }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">{activity.action}</Typography>
                    <Chip
                      label={activity.type}
                      size="small"
                      color={
                        getActivityColor(activity.type) as
                          | "primary"
                          | "secondary"
                          | "success"
                          | "info"
                          | "warning"
                      }
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                    {activity.details && (
                      <Typography variant="caption" color="primary.main">
                        {activity.details}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Nenhuma atividade recente
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}
