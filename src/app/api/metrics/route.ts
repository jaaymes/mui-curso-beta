import { NextResponse } from 'next/server';

// Simple metrics collection for Prometheus
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

export async function GET() {
  try {
    requestCount++;
    
    const uptime = (Date.now() - startTime) / 1000;
    const memUsage = process.memoryUsage();
    
    // Prometheus metrics format
    const metrics = `
# HELP nextjs_http_requests_total Total number of HTTP requests
# TYPE nextjs_http_requests_total counter
nextjs_http_requests_total ${requestCount}

# HELP nextjs_http_errors_total Total number of HTTP errors
# TYPE nextjs_http_errors_total counter
nextjs_http_errors_total ${errorCount}

# HELP nextjs_uptime_seconds Application uptime in seconds
# TYPE nextjs_uptime_seconds gauge
nextjs_uptime_seconds ${uptime}

# HELP nextjs_memory_usage_bytes Memory usage in bytes
# TYPE nextjs_memory_usage_bytes gauge
nextjs_memory_usage_bytes{type="rss"} ${memUsage.rss}
nextjs_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}
nextjs_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}
nextjs_memory_usage_bytes{type="external"} ${memUsage.external}

# HELP nextjs_cpu_usage_seconds CPU usage in seconds
# TYPE nextjs_cpu_usage_seconds gauge
nextjs_cpu_usage_seconds{mode="user"} ${process.cpuUsage().user / 1000000}
nextjs_cpu_usage_seconds{mode="system"} ${process.cpuUsage().system / 1000000}

# HELP nextjs_nodejs_version Node.js version info
# TYPE nextjs_nodejs_version gauge
nextjs_nodejs_version{version="${process.version}"} 1
`.trim();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    errorCount++;
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}