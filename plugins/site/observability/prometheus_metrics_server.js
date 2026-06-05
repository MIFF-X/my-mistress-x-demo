// prometheus_metrics_server.js
// Small Express server to expose /metrics for Prometheus to scrape.
const express = require('express');
const app = express();
const { promClient } = require('./analytics_cache_middleware');

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

const port = process.env.METRICS_PORT || 9100;
app.listen(port, () => console.log(`Metrics server listening on ${port}/metrics`));
