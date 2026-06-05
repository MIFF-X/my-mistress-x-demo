# Analytics Cache Metrics & Monitoring

Files added:
- analytics_cache_middleware.js (updated): Redis caching middleware with Prometheus metrics.
- prometheus_metrics_server.js: Small metrics server exposing /metrics for Prometheus.
- grafana_cache_dashboard.json: Grafana dashboard JSON snippet to import.
- prometheus_scrape_config.yml: Example Prometheus scrape config snippet.

Setup steps:
1. Install dependencies in your backend project:
   npm install prom-client redis

2. Set environment variables:
   - REDIS_URL (redis://...)
   - ANALYTICS_CACHE_TTL (seconds)
   - METRICS_PORT (optional, default 9100)

3. Run metrics server (can be the same process as your app; here it's a small separate server):
   node frontend/plugins/site/observability/prometheus_metrics_server.js

4. Configure Prometheus to scrape the metrics endpoint. Edit prometheus_scrape_config.yml and replace HOST with your host.

5. Import grafana_cache_dashboard.json into Grafana (Dashboards -> Import).

Notes:
- You can also integrate prom-client metrics with your main Express app by mounting an endpoint /metrics that returns promClient.register.metrics(). If you run metrics server separately, ensure network access and firewall rules allow Prometheus to scrape.
- The analytics cache middleware sets X-Cache and X-Cache-Key headers to help debug cached responses.

