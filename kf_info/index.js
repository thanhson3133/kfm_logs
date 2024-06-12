const express = require('express');
const { createLogger, transports, format } = require('winston');
const {ElasticsearchTransport} = require('winston-elasticsearch');

const app = express();
const port = 3001;

const esTransportOpts = {
  level: 'info',
  clientOpts: { node: 'http://elasticsearch:9200' },
  indexPrefix: 'kf_info_logs',
  transformer: (logData) => ({
    '@timestamp': new Date().toISOString(),
    severity: logData.level,
    message: logData.message,
    fields: logData.meta,
  }),
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new ElasticsearchTransport(esTransportOpts)
  ]
});

// // Tạo chỉ mục nếu chưa tồn tại
// const createIndex = async () => {
//   const indexName = 'kf_info_logs';
//   const { body: exists } = await esClient.indices.exists({ index: indexName });
//   if (!exists) {
//     await esClient.indices.create({ index: indexName });
//     console.log(`Index ${indexName} created`);
//   }
// };

// createIndex().catch(console.error);

app.use((req, res, next) => {
  // logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get('/api', (req, res) => {
  logger.info({message: 'KF Info API hit', severity: 'info'});
  res.send('Hello from KF Info!');
});

app.listen(port, () => {
  console.log(port);
  logger.info(`KF Info started on port ${port}`);
});
