import { Box, CircularProgress, Typography, Skeleton, Grid } from '@mui/material';

/**
 * Loading page for dashboard
 * Shows while server-side data is being fetched
 */
export default function Loading() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Visão Geral do Painel
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Carregando dados do dashboard...
      </Typography>

      {/* Stats Cards Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Stats Skeleton */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>

      {/* Loading indicator overlay */}
      <Box 
        position="fixed" 
        top="50%" 
        left="50%" 
        sx={{ transform: 'translate(-50%, -50%)' }}
      >
        <CircularProgress size={60} />
      </Box>
    </Box>
  );
}